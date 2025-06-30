import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, asc, and, sql, count, gte, lte, or, inArray, ne, isNull } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

import {
  GoatedLinkingRequest,
  CreateLinkingRequestInput,
  LinkingVerificationLog,
  GoatedLinkingHistory
} from '../../domain/entities/GoatedLinking';
import { IGoatedLinkingRepository } from '../../domain/repositories/IGoatedLinkingRepository';
import { goatedLinkingRequests, linkingVerificationLog, goatedLinkingHistory, users } from './schema';

export class DrizzleGoatedLinkingRepository implements IGoatedLinkingRepository {
  private db;
  
  constructor(connectionString: string) {
    const sql = neon(connectionString);
    this.db = drizzle(sql);
  }

  // Linking request CRUD operations
  async createRequest(input: CreateLinkingRequestInput & {
    userId: string;
    status?: string;
    ipAddress?: string;
    userAgent?: string;
    requestSource?: string;
    externalDataVerified?: boolean;
    wagerDataMatches?: boolean;
    identityVerified?: boolean;
    isActive?: boolean;
  }): Promise<GoatedLinkingRequest> {
    const id = uuidv4();
    const now = new Date();
    
    const requestData = {
      id,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    
    const [request] = await this.db
      .insert(goatedLinkingRequests)
      .values(requestData)
      .returning();
      
    return this.mapRequestToEntity(request);
  }

  async findById(id: string): Promise<GoatedLinkingRequest | null> {
    const [request] = await this.db
      .select()
      .from(goatedLinkingRequests)
      .where(eq(goatedLinkingRequests.id, id))
      .limit(1);
      
    return request ? this.mapRequestToEntity(request) : null;
  }

  async updateRequest(id: string, data: Partial<GoatedLinkingRequest>): Promise<GoatedLinkingRequest | null> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    
    const [request] = await this.db
      .update(goatedLinkingRequests)
      .set(updateData)
      .where(eq(goatedLinkingRequests.id, id))
      .returning();
      
    return request ? this.mapRequestToEntity(request) : null;
  }

  async deleteRequest(id: string): Promise<boolean> {
    const result = await this.db
      .delete(goatedLinkingRequests)
      .where(eq(goatedLinkingRequests.id, id));
      
    return result.rowCount > 0;
  }

  // Find requests by various criteria
  async findRequestsByUserId(userId: string): Promise<GoatedLinkingRequest[]> {
    const requests = await this.db
      .select()
      .from(goatedLinkingRequests)
      .where(eq(goatedLinkingRequests.userId, userId))
      .orderBy(desc(goatedLinkingRequests.createdAt));
    
    return requests.map(req => this.mapRequestToEntity(req));
  }

  async findActiveRequestByUserId(userId: string): Promise<GoatedLinkingRequest | null> {
    const [request] = await this.db
      .select()
      .from(goatedLinkingRequests)
      .where(
        and(
          eq(goatedLinkingRequests.userId, userId),
          or(
            eq(goatedLinkingRequests.status, 'pending'),
            eq(goatedLinkingRequests.status, 'under_review')
          )
        )
      )
      .orderBy(desc(goatedLinkingRequests.createdAt))
      .limit(1);
      
    return request ? this.mapRequestToEntity(request) : null;
  }

  async findRequestsByStatus(
    status: string, 
    limit = 20, 
    offset = 0
  ): Promise<{ requests: GoatedLinkingRequest[]; total: number }> {
    // Get total count
    const [{ count: totalCount }] = await this.db
      .select({ count: count() })
      .from(goatedLinkingRequests)
      .where(eq(goatedLinkingRequests.status, status));
    
    // Get requests
    const requests = await this.db
      .select()
      .from(goatedLinkingRequests)
      .where(eq(goatedLinkingRequests.status, status))
      .orderBy(desc(goatedLinkingRequests.createdAt))
      .limit(limit)
      .offset(offset);
    
    return {
      requests: requests.map(req => this.mapRequestToEntity(req)),
      total: totalCount
    };
  }

  async findRequestsByGoatedId(goatedId: string): Promise<GoatedLinkingRequest[]> {
    const requests = await this.db
      .select()
      .from(goatedLinkingRequests)
      .where(eq(goatedLinkingRequests.claimedGoatedId, goatedId))
      .orderBy(desc(goatedLinkingRequests.createdAt));
    
    return requests.map(req => this.mapRequestToEntity(req));
  }

  // Search and filtering
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
    const conditions = [];
    
    if (filters.status) {
      conditions.push(eq(goatedLinkingRequests.status, filters.status));
    }
    if (filters.userId) {
      conditions.push(eq(goatedLinkingRequests.userId, filters.userId));
    }
    if (filters.goatedId) {
      conditions.push(eq(goatedLinkingRequests.claimedGoatedId, filters.goatedId));
    }
    if (filters.verificationMethod) {
      conditions.push(eq(goatedLinkingRequests.verificationMethod, filters.verificationMethod));
    }
    if (filters.dateFrom) {
      conditions.push(gte(goatedLinkingRequests.createdAt, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(goatedLinkingRequests.createdAt, filters.dateTo));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const [{ count: totalCount }] = await this.db
      .select({ count: count() })
      .from(goatedLinkingRequests)
      .where(whereClause);
    
    // Get requests
    const requests = await this.db
      .select()
      .from(goatedLinkingRequests)
      .where(whereClause)
      .orderBy(desc(goatedLinkingRequests.createdAt))
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);
    
    return {
      requests: requests.map(req => this.mapRequestToEntity(req)),
      total: totalCount
    };
  }

  // Verification log operations
  async addVerificationLog(logData: Omit<LinkingVerificationLog, 'id' | 'createdAt'>): Promise<LinkingVerificationLog> {
    const id = uuidv4();
    const now = new Date();
    
    const logEntry = {
      id,
      ...logData,
      createdAt: now,
    };
    
    const [log] = await this.db
      .insert(linkingVerificationLog)
      .values(logEntry)
      .returning();
      
    return this.mapVerificationLogToEntity(log);
  }

  async getVerificationLogs(linkingRequestId: string): Promise<LinkingVerificationLog[]> {
    const logs = await this.db
      .select()
      .from(linkingVerificationLog)
      .where(eq(linkingVerificationLog.linkingRequestId, linkingRequestId))
      .orderBy(desc(linkingVerificationLog.createdAt));
    
    return logs.map(log => this.mapVerificationLogToEntity(log));
  }

  async getVerificationLogsByType(
    linkingRequestId: string, 
    verificationType: string
  ): Promise<LinkingVerificationLog[]> {
    const logs = await this.db
      .select()
      .from(linkingVerificationLog)
      .where(
        and(
          eq(linkingVerificationLog.linkingRequestId, linkingRequestId),
          eq(linkingVerificationLog.verificationType, verificationType)
        )
      )
      .orderBy(desc(linkingVerificationLog.createdAt));
    
    return logs.map(log => this.mapVerificationLogToEntity(log));
  }

  // Linking history operations
  async createHistory(historyData: Omit<GoatedLinkingHistory, 'id' | 'createdAt'>): Promise<GoatedLinkingHistory> {
    const id = uuidv4();
    const now = new Date();
    
    const historyEntry = {
      id,
      ...historyData,
      createdAt: now,
    };
    
    const [history] = await this.db
      .insert(goatedLinkingHistory)
      .values(historyEntry)
      .returning();
      
    return this.mapHistoryToEntity(history);
  }

  async findLinkingHistory(userId: string): Promise<GoatedLinkingHistory[]> {
    const history = await this.db
      .select()
      .from(goatedLinkingHistory)
      .where(eq(goatedLinkingHistory.userId, userId))
      .orderBy(desc(goatedLinkingHistory.createdAt));
    
    return history.map(h => this.mapHistoryToEntity(h));
  }

  async findActiveLinkingHistory(userId: string): Promise<GoatedLinkingHistory | null> {
    const [history] = await this.db
      .select()
      .from(goatedLinkingHistory)
      .where(
        and(
          eq(goatedLinkingHistory.userId, userId),
          eq(goatedLinkingHistory.status, 'active')
        )
      )
      .orderBy(desc(goatedLinkingHistory.linkedAt))
      .limit(1);
      
    return history ? this.mapHistoryToEntity(history) : null;
  }

  async updateHistory(id: string, data: Partial<GoatedLinkingHistory>): Promise<GoatedLinkingHistory | null> {
    const [history] = await this.db
      .update(goatedLinkingHistory)
      .set(data)
      .where(eq(goatedLinkingHistory.id, id))
      .returning();
      
    return history ? this.mapHistoryToEntity(history) : null;
  }

  // Statistics and analytics
  async getLinkingStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    linkedAccounts: number;
    requestsThisWeek: number;
  }> {
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const [requestStats] = await this.db
      .select({
        totalRequests: count(),
        pendingRequests: count(sql`CASE WHEN ${goatedLinkingRequests.status} = 'pending' THEN 1 END`),
        approvedRequests: count(sql`CASE WHEN ${goatedLinkingRequests.status} = 'approved' THEN 1 END`),
        rejectedRequests: count(sql`CASE WHEN ${goatedLinkingRequests.status} = 'rejected' THEN 1 END`),
        requestsThisWeek: count(sql`CASE WHEN ${goatedLinkingRequests.createdAt} >= ${thisWeek} THEN 1 END`),
      })
      .from(goatedLinkingRequests);
    
    const [{ count: linkedAccounts }] = await this.db
      .select({ count: count() })
      .from(goatedLinkingHistory)
      .where(eq(goatedLinkingHistory.status, 'active'));
    
    return {
      totalRequests: requestStats.totalRequests,
      pendingRequests: requestStats.pendingRequests,
      approvedRequests: requestStats.approvedRequests,
      rejectedRequests: requestStats.rejectedRequests,
      linkedAccounts,
      requestsThisWeek: requestStats.requestsThisWeek,
    };
  }

  async getRequestsByTimeframe(
    timeframe: 'day' | 'week' | 'month',
    status?: string
  ): Promise<{ date: string; count: number }[]> {
    let interval: string;
    let format: string;
    
    switch (timeframe) {
      case 'day':
        interval = '1 day';
        format = 'YYYY-MM-DD';
        break;
      case 'week':
        interval = '1 week';
        format = 'YYYY-"W"WW';
        break;
      case 'month':
        interval = '1 month';
        format = 'YYYY-MM';
        break;
      default:
        throw new Error(`Unknown timeframe: ${timeframe}`);
    }
    
    const conditions = [];
    if (status) {
      conditions.push(eq(goatedLinkingRequests.status, status));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const results = await this.db
      .select({
        date: sql<string>`TO_CHAR(${goatedLinkingRequests.createdAt}, ${format})`,
        count: count(),
      })
      .from(goatedLinkingRequests)
      .where(whereClause)
      .groupBy(sql`TO_CHAR(${goatedLinkingRequests.createdAt}, ${format})`)
      .orderBy(sql`TO_CHAR(${goatedLinkingRequests.createdAt}, ${format})`);
    
    return results.map(result => ({
      date: result.date,
      count: result.count,
    }));
  }

  // Admin dashboard queries
  async getRecentActivity(limit = 50): Promise<Array<{
    id: string;
    type: 'request_created' | 'request_approved' | 'request_rejected' | 'account_linked' | 'account_unlinked';
    userId: string;
    username?: string;
    goatedId?: string;
    goatedUsername?: string;
    timestamp: Date;
    adminId?: string;
    adminUsername?: string;
  }>> {
    // Get recent requests
    const recentRequests = await this.db
      .select({
        id: goatedLinkingRequests.id,
        userId: goatedLinkingRequests.userId,
        goatedId: goatedLinkingRequests.claimedGoatedId,
        goatedUsername: goatedLinkingRequests.claimedGoatedUsername,
        status: goatedLinkingRequests.status,
        createdAt: goatedLinkingRequests.createdAt,
        reviewedAt: goatedLinkingRequests.reviewedAt,
        reviewedBy: goatedLinkingRequests.reviewedBy,
        username: users.username,
      })
      .from(goatedLinkingRequests)
      .leftJoin(users, eq(goatedLinkingRequests.userId, users.id))
      .orderBy(desc(goatedLinkingRequests.createdAt))
      .limit(limit);
    
    // Get recent history
    const recentHistory = await this.db
      .select({
        id: goatedLinkingHistory.id,
        userId: goatedLinkingHistory.userId,
        goatedId: goatedLinkingHistory.goatedId,
        goatedUsername: goatedLinkingHistory.goatedUsername,
        status: goatedLinkingHistory.status,
        linkedAt: goatedLinkingHistory.linkedAt,
        unlinkedAt: goatedLinkingHistory.unlinkedAt,
        linkedBy: goatedLinkingHistory.linkedBy,
        unlinkedBy: goatedLinkingHistory.unlinkedBy,
        username: users.username,
      })
      .from(goatedLinkingHistory)
      .leftJoin(users, eq(goatedLinkingHistory.userId, users.id))
      .orderBy(desc(goatedLinkingHistory.linkedAt))
      .limit(limit);
    
    const activities: Array<{
      id: string;
      type: 'request_created' | 'request_approved' | 'request_rejected' | 'account_linked' | 'account_unlinked';
      userId: string;
      username?: string;
      goatedId?: string;
      goatedUsername?: string;
      timestamp: Date;
      adminId?: string;
      adminUsername?: string;
    }> = [];
    
    // Process requests
    for (const req of recentRequests) {
      activities.push({
        id: req.id,
        type: 'request_created',
        userId: req.userId,
        username: req.username || undefined,
        goatedId: req.goatedId,
        goatedUsername: req.goatedUsername,
        timestamp: req.createdAt,
      });
      
      if (req.reviewedAt && req.status === 'approved') {
        activities.push({
          id: req.id,
          type: 'request_approved',
          userId: req.userId,
          username: req.username || undefined,
          goatedId: req.goatedId,
          goatedUsername: req.goatedUsername,
          timestamp: req.reviewedAt,
          adminId: req.reviewedBy || undefined,
        });
      } else if (req.reviewedAt && req.status === 'rejected') {
        activities.push({
          id: req.id,
          type: 'request_rejected',
          userId: req.userId,
          username: req.username || undefined,
          goatedId: req.goatedId,
          goatedUsername: req.goatedUsername,
          timestamp: req.reviewedAt,
          adminId: req.reviewedBy || undefined,
        });
      }
    }
    
    // Process history
    for (const hist of recentHistory) {
      activities.push({
        id: hist.id,
        type: 'account_linked',
        userId: hist.userId,
        username: hist.username || undefined,
        goatedId: hist.goatedId,
        goatedUsername: hist.goatedUsername,
        timestamp: hist.linkedAt,
        adminId: hist.linkedBy,
      });
      
      if (hist.unlinkedAt) {
        activities.push({
          id: hist.id,
          type: 'account_unlinked',
          userId: hist.userId,
          username: hist.username || undefined,
          goatedId: hist.goatedId,
          goatedUsername: hist.goatedUsername,
          timestamp: hist.unlinkedAt,
          adminId: hist.unlinkedBy || undefined,
        });
      }
    }
    
    // Sort by timestamp and return limited results
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getPendingRequestsWithUserInfo(
    limit = 20, 
    offset = 0
  ): Promise<{ 
    requests: Array<GoatedLinkingRequest & {
      userUsername: string;
      userEmail: string;
      userCreatedAt: Date;
      userLastLoginAt?: Date;
    }>; 
    total: number; 
  }> {
    // Get total count
    const [{ count: totalCount }] = await this.db
      .select({ count: count() })
      .from(goatedLinkingRequests)
      .where(eq(goatedLinkingRequests.status, 'pending'));
    
    // Get requests with user info
    const requests = await this.db
      .select({
        // Request fields
        id: goatedLinkingRequests.id,
        userId: goatedLinkingRequests.userId,
        claimedGoatedId: goatedLinkingRequests.claimedGoatedId,
        claimedGoatedUsername: goatedLinkingRequests.claimedGoatedUsername,
        verificationMethod: goatedLinkingRequests.verificationMethod,
        verificationData: goatedLinkingRequests.verificationData,
        userMessage: goatedLinkingRequests.userMessage,
        status: goatedLinkingRequests.status,
        reviewedBy: goatedLinkingRequests.reviewedBy,
        reviewedAt: goatedLinkingRequests.reviewedAt,
        adminNotes: goatedLinkingRequests.adminNotes,
        rejectionReason: goatedLinkingRequests.rejectionReason,
        externalDataVerified: goatedLinkingRequests.externalDataVerified,
        wagerDataMatches: goatedLinkingRequests.wagerDataMatches,
        identityVerified: goatedLinkingRequests.identityVerified,
        ipAddress: goatedLinkingRequests.ipAddress,
        userAgent: goatedLinkingRequests.userAgent,
        requestSource: goatedLinkingRequests.requestSource,
        createdAt: goatedLinkingRequests.createdAt,
        updatedAt: goatedLinkingRequests.updatedAt,
        // User fields
        userUsername: users.username,
        userEmail: users.email,
        userCreatedAt: users.createdAt,
        userLastLoginAt: users.lastLoginAt,
      })
      .from(goatedLinkingRequests)
      .leftJoin(users, eq(goatedLinkingRequests.userId, users.id))
      .where(eq(goatedLinkingRequests.status, 'pending'))
      .orderBy(desc(goatedLinkingRequests.createdAt))
      .limit(limit)
      .offset(offset);
    
    return {
      requests: requests.map(req => ({
        ...this.mapRequestToEntity(req),
        userUsername: req.userUsername,
        userEmail: req.userEmail,
        userCreatedAt: req.userCreatedAt,
        userLastLoginAt: req.userLastLoginAt || undefined,
      })),
      total: totalCount
    };
  }

  // Validation helpers
  async isGoatedIdAlreadyLinked(goatedId: string, excludeUserId?: string): Promise<boolean> {
    const conditions = [
      eq(goatedLinkingHistory.goatedId, goatedId),
      eq(goatedLinkingHistory.status, 'active')
    ];
    
    if (excludeUserId) {
      conditions.push(ne(goatedLinkingHistory.userId, excludeUserId));
    }
    
    const [result] = await this.db
      .select({ count: count() })
      .from(goatedLinkingHistory)
      .where(and(...conditions));
    
    return result.count > 0;
  }

  async getUserCurrentGoatedLink(userId: string): Promise<{
    goatedId: string;
    goatedUsername: string;
    linkedAt: Date;
  } | null> {
    const [link] = await this.db
      .select({
        goatedId: goatedLinkingHistory.goatedId,
        goatedUsername: goatedLinkingHistory.goatedUsername,
        linkedAt: goatedLinkingHistory.linkedAt,
      })
      .from(goatedLinkingHistory)
      .where(
        and(
          eq(goatedLinkingHistory.userId, userId),
          eq(goatedLinkingHistory.status, 'active')
        )
      )
      .orderBy(desc(goatedLinkingHistory.linkedAt))
      .limit(1);
      
    return link || null;
  }

  // Bulk operations
  async bulkUpdateRequestStatus(
    requestIds: string[], 
    status: string, 
    adminId: string, 
    adminNotes?: string
  ): Promise<number> {
    if (requestIds.length === 0) return 0;
    
    const result = await this.db
      .update(goatedLinkingRequests)
      .set({
        status,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNotes,
        updatedAt: new Date(),
      })
      .where(inArray(goatedLinkingRequests.id, requestIds));
    
    return result.rowCount || 0;
  }

  // Maintenance operations
  async cleanupOldRejectedRequests(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const result = await this.db
      .delete(goatedLinkingRequests)
      .where(
        and(
          eq(goatedLinkingRequests.status, 'rejected'),
          lte(goatedLinkingRequests.createdAt, cutoffDate)
        )
      );
    
    return result.rowCount || 0;
  }

  async archiveCompletedRequests(olderThanDays: number): Promise<number> {
    // This would move completed requests to an archive table
    // For now, just return 0 as no archiving is implemented
    return 0;
  }

  // Performance optimization
  async getRequestsNeedingReview(priority?: 'high' | 'normal' | 'low'): Promise<GoatedLinkingRequest[]> {
    let orderBy = desc(goatedLinkingRequests.createdAt);
    
    if (priority === 'high') {
      // Prioritize requests that have been waiting longest
      orderBy = asc(goatedLinkingRequests.createdAt);
    }
    
    const requests = await this.db
      .select()
      .from(goatedLinkingRequests)
      .where(eq(goatedLinkingRequests.status, 'pending'))
      .orderBy(orderBy);
    
    return requests.map(req => this.mapRequestToEntity(req));
  }

  async markRequestsAsReviewed(requestIds: string[], reviewedBy: string): Promise<void> {
    if (requestIds.length === 0) return;
    
    await this.db
      .update(goatedLinkingRequests)
      .set({
        status: 'under_review',
        reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(inArray(goatedLinkingRequests.id, requestIds));
  }

  // Helper methods
  private mapRequestToEntity(dbRequest: any): GoatedLinkingRequest {
    return {
      id: dbRequest.id,
      userId: dbRequest.userId,
      claimedGoatedId: dbRequest.claimedGoatedId,
      claimedGoatedUsername: dbRequest.claimedGoatedUsername,
      verificationMethod: dbRequest.verificationMethod,
      verificationData: dbRequest.verificationData,
      userMessage: dbRequest.userMessage,
      status: dbRequest.status,
      reviewedBy: dbRequest.reviewedBy,
      reviewedAt: dbRequest.reviewedAt,
      adminNotes: dbRequest.adminNotes,
      rejectionReason: dbRequest.rejectionReason,
      externalDataVerified: dbRequest.externalDataVerified,
      wagerDataMatches: dbRequest.wagerDataMatches,
      identityVerified: dbRequest.identityVerified,
      ipAddress: dbRequest.ipAddress,
      userAgent: dbRequest.userAgent,
      requestSource: dbRequest.requestSource,
      createdAt: dbRequest.createdAt,
      updatedAt: dbRequest.updatedAt,
    };
  }

  private mapVerificationLogToEntity(dbLog: any): LinkingVerificationLog {
    return {
      id: dbLog.id,
      linkingRequestId: dbLog.linkingRequestId,
      verificationType: dbLog.verificationType,
      verificationResult: dbLog.verificationResult,
      verificationData: dbLog.verificationData,
      errorMessage: dbLog.errorMessage,
      performedBy: dbLog.performedBy,
      performedByType: dbLog.performedByType,
      createdAt: dbLog.createdAt,
    };
  }

  private mapHistoryToEntity(dbHistory: any): GoatedLinkingHistory {
    return {
      id: dbHistory.id,
      userId: dbHistory.userId,
      goatedId: dbHistory.goatedId,
      goatedUsername: dbHistory.goatedUsername,
      linkedBy: dbHistory.linkedBy,
      linkingRequestId: dbHistory.linkingRequestId,
      status: dbHistory.status,
      unlinkReason: dbHistory.unlinkReason,
      unlinkedBy: dbHistory.unlinkedBy,
      unlinkedAt: dbHistory.unlinkedAt,
      linkedAt: dbHistory.linkedAt,
      createdAt: dbHistory.createdAt,
    };
  }
}