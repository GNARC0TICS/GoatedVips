import {
  GoatedLinkingRequest,
  CreateLinkingRequestInput,
  ReviewLinkingRequestInput,
  UserLinkingRequestInput,
  BulkLinkingOperationInput,
  LinkingVerificationLog,
  GoatedLinkingHistory,
  validateVerificationDataForMethod
} from '../entities/GoatedLinking';
import { IGoatedLinkingRepository } from '../repositories/IGoatedLinkingRepository';
import { ICacheService } from '../../infrastructure/cache/ICacheService';
import { UserService } from './UserService';
import { WagerSyncService } from './WagerSyncService';

export class GoatedLinkingService {
  constructor(
    private linkingRepository: IGoatedLinkingRepository,
    private userService: UserService,
    private wagerSyncService: WagerSyncService,
    private cacheService: ICacheService
  ) {}

  /**
   * Create a new linking request from a user
   */
  async createLinkingRequest(
    userId: string,
    input: CreateLinkingRequestInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<GoatedLinkingRequest> {
    // Validate that user exists
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has an active linking request
    const existingRequest = await this.linkingRepository.findActiveRequestByUserId(userId);
    if (existingRequest) {
      throw new Error('You already have a pending linking request. Please wait for admin review.');
    }

    // Check if user is already linked to a Goated account
    if (user.goatedLinked && user.goatedId) {
      throw new Error('Your account is already linked to a Goated account. Contact support if you need to change it.');
    }

    // Check if the claimed Goated ID is already linked to another user
    const existingLink = await this.userService.findByGoatedId(input.claimedGoatedId);
    if (existingLink && existingLink.id !== userId) {
      throw new Error('This Goated account is already linked to another user. If you believe this is an error, please contact support.');
    }

    // Validate verification data format
    if (input.verificationData) {
      const validation = validateVerificationDataForMethod(input.verificationMethod, input.verificationData);
      if (!validation.isValid) {
        throw new Error(`Invalid verification data: ${validation.error}`);
      }
    }

    // Check if the claimed Goated account exists in external API
    try {
      const externalUser = await this.wagerSyncService.syncUser(input.claimedGoatedId);
      if (!externalUser) {
        throw new Error('The claimed Goated account was not found in the external system. Please verify the username/ID is correct.');
      }

      // Verify the username matches
      if (externalUser.name.toLowerCase() !== input.claimedGoatedUsername.toLowerCase()) {
        throw new Error(`Username mismatch: External system shows "${externalUser.name}" but you claimed "${input.claimedGoatedUsername}"`);
      }
    } catch (error) {
      console.error('Error verifying external Goated account:', error);
      // Don't block the request if external API is down, but log it
    }

    // Create the linking request
    const linkingRequest = await this.linkingRepository.createRequest({
      userId,
      claimedGoatedId: input.claimedGoatedId,
      claimedGoatedUsername: input.claimedGoatedUsername,
      verificationMethod: input.verificationMethod,
      verificationData: input.verificationData,
      userMessage: input.userMessage,
      status: 'pending',
      ipAddress,
      userAgent,
      requestSource: 'web',
      externalDataVerified: false,
      wagerDataMatches: false,
      identityVerified: false,
      isActive: true,
    });

    // Log the creation
    await this.addVerificationLog(linkingRequest.id, {
      verificationType: 'manual_review',
      verificationResult: 'success',
      verificationData: {
        action: 'request_created',
        verificationMethod: input.verificationMethod,
        claimedAccount: input.claimedGoatedId,
      },
      performedByType: 'system',
    });

    // Invalidate relevant caches
    await this.invalidateLinkingCaches(userId);

    return linkingRequest;
  }

  /**
   * Admin review of a linking request
   */
  async reviewLinkingRequest(
    input: ReviewLinkingRequestInput,
    adminId: string
  ): Promise<GoatedLinkingRequest> {
    const request = await this.linkingRepository.findById(input.requestId);
    if (!request) {
      throw new Error('Linking request not found');
    }

    if (request.status !== 'pending' && request.status !== 'under_review') {
      throw new Error(`Cannot review request with status: ${request.status}`);
    }

    const updateData: Partial<GoatedLinkingRequest> = {
      reviewedBy: adminId,
      reviewedAt: new Date(),
      adminNotes: input.adminNotes,
      updatedAt: new Date(),
    };

    // Update verification flags if provided
    if (input.externalDataVerified !== undefined) {
      updateData.externalDataVerified = input.externalDataVerified;
    }
    if (input.wagerDataMatches !== undefined) {
      updateData.wagerDataMatches = input.wagerDataMatches;
    }
    if (input.identityVerified !== undefined) {
      updateData.identityVerified = input.identityVerified;
    }

    let logAction = '';

    switch (input.action) {
      case 'approve':
        await this.approveLinkingRequest(request, adminId, input.adminNotes);
        updateData.status = 'approved';
        logAction = 'approved';
        break;

      case 'reject':
        updateData.status = 'rejected';
        updateData.rejectionReason = input.rejectionReason;
        logAction = 'rejected';
        break;

      case 'request_more_info':
        updateData.status = 'under_review';
        logAction = 'requested_more_info';
        break;
    }

    // Update the request
    const updatedRequest = await this.linkingRepository.updateRequest(request.id, updateData);
    if (!updatedRequest) {
      throw new Error('Failed to update linking request');
    }

    // Log the admin action
    await this.addVerificationLog(request.id, {
      verificationType: 'manual_review',
      verificationResult: input.action === 'approve' ? 'success' : input.action === 'reject' ? 'failed' : 'partial',
      verificationData: {
        action: logAction,
        adminNotes: input.adminNotes,
        rejectionReason: input.rejectionReason,
        verificationFlags: {
          externalDataVerified: input.externalDataVerified,
          wagerDataMatches: input.wagerDataMatches,
          identityVerified: input.identityVerified,
        },
      },
      performedBy: adminId,
      performedByType: 'admin',
    });

    // Invalidate caches
    await this.invalidateLinkingCaches(request.userId);

    return updatedRequest;
  }

  /**
   * Approve a linking request and actually link the accounts
   */
  private async approveLinkingRequest(
    request: GoatedLinkingRequest,
    adminId: string,
    adminNotes: string
  ): Promise<void> {
    // Double-check that the Goated account isn't already linked
    const existingLink = await this.userService.findByGoatedId(request.claimedGoatedId);
    if (existingLink && existingLink.id !== request.userId) {
      throw new Error('This Goated account is already linked to another user');
    }

    // Link the account in the users table
    const linkedUser = await this.userService.linkGoatedAccount(
      request.userId,
      request.claimedGoatedId,
      request.claimedGoatedUsername
    );

    if (!linkedUser) {
      throw new Error('Failed to link Goated account');
    }

    // Create linking history record
    await this.linkingRepository.createHistory({
      userId: request.userId,
      goatedId: request.claimedGoatedId,
      goatedUsername: request.claimedGoatedUsername,
      linkedBy: adminId,
      linkingRequestId: request.id,
      status: 'active',
      linkedAt: new Date(),
    });

    // Sync the user's wager data from external API
    try {
      await this.wagerSyncService.syncUser(request.claimedGoatedId);
    } catch (error) {
      console.error('Error syncing user wager data after linking:', error);
      // Don't fail the linking process if sync fails
    }
  }

  /**
   * Get all pending linking requests for admin review
   */
  async getPendingRequests(
    limit = 50,
    offset = 0
  ): Promise<{ requests: GoatedLinkingRequest[]; total: number }> {
    return this.linkingRepository.findRequestsByStatus('pending', limit, offset);
  }

  /**
   * Get linking requests by status
   */
  async getRequestsByStatus(
    status: string,
    limit = 50,
    offset = 0
  ): Promise<{ requests: GoatedLinkingRequest[]; total: number }> {
    return this.linkingRepository.findRequestsByStatus(status, limit, offset);
  }

  /**
   * Get user's linking request history
   */
  async getUserLinkingHistory(userId: string): Promise<GoatedLinkingRequest[]> {
    return this.linkingRepository.findRequestsByUserId(userId);
  }

  /**
   * Get linking request with verification logs
   */
  async getRequestDetails(requestId: string): Promise<{
    request: GoatedLinkingRequest | null;
    verificationLogs: LinkingVerificationLog[];
  }> {
    const request = await this.linkingRepository.findById(requestId);
    const logs = request ? await this.linkingRepository.getVerificationLogs(requestId) : [];
    
    return { request, verificationLogs: logs };
  }

  /**
   * Bulk operations for admin efficiency
   */
  async bulkReviewRequests(
    input: BulkLinkingOperationInput,
    adminId: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const operation of input.operations) {
      try {
        await this.reviewLinkingRequest({
          requestId: operation.requestId,
          action: operation.action,
          adminNotes: operation.adminNotes || input.bulkReason,
        }, adminId);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Request ${operation.requestId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * Unlink a Goated account (admin only)
   */
  async unlinkGoatedAccount(
    userId: string,
    reason: string,
    adminId: string
  ): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user || !user.goatedLinked || !user.goatedId) {
      throw new Error('User does not have a linked Goated account');
    }

    // Update user record to remove linking
    await this.userService.updateProfile(userId, {
      goatedId: null,
      goatedUsername: null,
      goatedLinked: false,
      goatedVerified: false,
    });

    // Update linking history
    const activeHistory = await this.linkingRepository.findActiveLinkingHistory(userId);
    if (activeHistory) {
      await this.linkingRepository.updateHistory(activeHistory.id, {
        status: 'unlinked',
        unlinkReason: reason,
        unlinkedBy: adminId,
        unlinkedAt: new Date(),
      });
    }

    // Invalidate caches
    await this.invalidateLinkingCaches(userId);
  }

  /**
   * Get linking statistics for admin dashboard
   */
  async getLinkingStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    linkedAccounts: number;
    requestsThisWeek: number;
  }> {
    return this.linkingRepository.getLinkingStats();
  }

  /**
   * Search linking requests with filters
   */
  async searchRequests(filters: {
    status?: string;
    userId?: string;
    goatedId?: string;
    verificationMethod?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ requests: GoatedLinkingRequest[]; total: number }> {
    return this.linkingRepository.searchRequests(filters);
  }

  /**
   * Add verification log entry
   */
  private async addVerificationLog(
    linkingRequestId: string,
    logData: Omit<LinkingVerificationLog, 'id' | 'linkingRequestId' | 'createdAt'>
  ): Promise<void> {
    await this.linkingRepository.addVerificationLog({
      ...logData,
      linkingRequestId,
    });
  }

  /**
   * Invalidate linking-related caches
   */
  private async invalidateLinkingCaches(userId: string): Promise<void> {
    const cacheKeys = [
      `user:${userId}`,
      `user_linking_requests:${userId}`,
      `pending_linking_requests`,
      `linking_stats`,
    ];

    for (const key of cacheKeys) {
      await this.cacheService.delete(key);
    }
  }

  /**
   * Verify external account data (automated check)
   */
  async verifyExternalAccountData(requestId: string): Promise<{
    accountExists: boolean;
    usernameMatches: boolean;
    hasWagerData: boolean;
    errorMessage?: string;
  }> {
    const request = await this.linkingRepository.findById(requestId);
    if (!request) {
      throw new Error('Linking request not found');
    }

    try {
      const externalUser = await this.wagerSyncService.syncUser(request.claimedGoatedId);
      
      const result = {
        accountExists: !!externalUser,
        usernameMatches: externalUser ? 
          externalUser.name.toLowerCase() === request.claimedGoatedUsername.toLowerCase() : false,
        hasWagerData: externalUser ? 
          (externalUser.wagered.all_time > 0 || externalUser.wagered.this_month > 0) : false,
      };

      // Log the verification attempt
      await this.addVerificationLog(requestId, {
        verificationType: 'external_api_check',
        verificationResult: result.accountExists && result.usernameMatches ? 'success' : 'failed',
        verificationData: {
          ...result,
          externalData: externalUser ? {
            name: externalUser.name,
            totalWager: externalUser.wagered.all_time,
            monthlyWager: externalUser.wagered.this_month,
          } : null,
        },
        performedByType: 'system',
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during verification';
      
      await this.addVerificationLog(requestId, {
        verificationType: 'external_api_check',
        verificationResult: 'failed',
        errorMessage,
        performedByType: 'system',
      });

      return {
        accountExists: false,
        usernameMatches: false,
        hasWagerData: false,
        errorMessage,
      };
    }
  }
}