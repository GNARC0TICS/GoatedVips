import {
  GoatedLinkingRequest,
  CreateLinkingRequestInput,
  LinkingVerificationLog,
  GoatedLinkingHistory
} from '../entities/GoatedLinking';

export interface IGoatedLinkingRepository {
  // Linking request CRUD operations
  createRequest(input: CreateLinkingRequestInput & {
    userId: string;
    status?: string;
    ipAddress?: string;
    userAgent?: string;
    requestSource?: string;
    externalDataVerified?: boolean;
    wagerDataMatches?: boolean;
    identityVerified?: boolean;
    isActive?: boolean;
  }): Promise<GoatedLinkingRequest>;

  findById(id: string): Promise<GoatedLinkingRequest | null>;
  
  updateRequest(id: string, data: Partial<GoatedLinkingRequest>): Promise<GoatedLinkingRequest | null>;
  
  deleteRequest(id: string): Promise<boolean>;

  // Find requests by various criteria
  findRequestsByUserId(userId: string): Promise<GoatedLinkingRequest[]>;
  
  findActiveRequestByUserId(userId: string): Promise<GoatedLinkingRequest | null>;
  
  findRequestsByStatus(
    status: string, 
    limit?: number, 
    offset?: number
  ): Promise<{ requests: GoatedLinkingRequest[]; total: number }>;

  findRequestsByGoatedId(goatedId: string): Promise<GoatedLinkingRequest[]>;

  // Search and filtering
  searchRequests(filters: {
    status?: string;
    userId?: string;
    goatedId?: string;
    verificationMethod?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ requests: GoatedLinkingRequest[]; total: number }>;

  // Verification log operations
  addVerificationLog(logData: Omit<LinkingVerificationLog, 'id' | 'createdAt'>): Promise<LinkingVerificationLog>;
  
  getVerificationLogs(linkingRequestId: string): Promise<LinkingVerificationLog[]>;
  
  getVerificationLogsByType(
    linkingRequestId: string, 
    verificationType: string
  ): Promise<LinkingVerificationLog[]>;

  // Linking history operations
  createHistory(historyData: Omit<GoatedLinkingHistory, 'id' | 'createdAt'>): Promise<GoatedLinkingHistory>;
  
  findLinkingHistory(userId: string): Promise<GoatedLinkingHistory[]>;
  
  findActiveLinkingHistory(userId: string): Promise<GoatedLinkingHistory | null>;
  
  updateHistory(id: string, data: Partial<GoatedLinkingHistory>): Promise<GoatedLinkingHistory | null>;

  // Statistics and analytics
  getLinkingStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    linkedAccounts: number;
    requestsThisWeek: number;
  }>;

  getRequestsByTimeframe(
    timeframe: 'day' | 'week' | 'month',
    status?: string
  ): Promise<{ date: string; count: number }[]>;

  // Admin dashboard queries
  getRecentActivity(limit?: number): Promise<Array<{
    id: string;
    type: 'request_created' | 'request_approved' | 'request_rejected' | 'account_linked' | 'account_unlinked';
    userId: string;
    username?: string;
    goatedId?: string;
    goatedUsername?: string;
    timestamp: Date;
    adminId?: string;
    adminUsername?: string;
  }>>;

  getPendingRequestsWithUserInfo(
    limit?: number, 
    offset?: number
  ): Promise<{ 
    requests: Array<GoatedLinkingRequest & {
      userUsername: string;
      userEmail: string;
      userCreatedAt: Date;
      userLastLoginAt?: Date;
    }>; 
    total: number; 
  }>;

  // Validation helpers
  isGoatedIdAlreadyLinked(goatedId: string, excludeUserId?: string): Promise<boolean>;
  
  getUserCurrentGoatedLink(userId: string): Promise<{
    goatedId: string;
    goatedUsername: string;
    linkedAt: Date;
  } | null>;

  // Bulk operations
  bulkUpdateRequestStatus(
    requestIds: string[], 
    status: string, 
    adminId: string, 
    adminNotes?: string
  ): Promise<number>;

  // Maintenance operations
  cleanupOldRejectedRequests(olderThanDays: number): Promise<number>;
  
  archiveCompletedRequests(olderThanDays: number): Promise<number>;

  // Performance optimization
  getRequestsNeedingReview(priority?: 'high' | 'normal' | 'low'): Promise<GoatedLinkingRequest[]>;
  
  markRequestsAsReviewed(requestIds: string[], reviewedBy: string): Promise<void>;
}