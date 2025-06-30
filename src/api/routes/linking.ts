import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { GoatedLinkingService } from '../../domain/services/GoatedLinkingService';
import { AuthMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { 
  UserLinkingRequestInput,
  ReviewLinkingRequestInput,
  BulkLinkingOperationInput 
} from '../../domain/entities/GoatedLinking';

// Request schemas
const CreateLinkingRequestSchema = UserLinkingRequestInput;

const AdminReviewRequestSchema = ReviewLinkingRequestInput;

const AdminBulkOperationSchema = BulkLinkingOperationInput;

const AdminUnlinkAccountSchema = z.object({
  reason: z.string().min(1).max(500),
});

const SearchRequestsSchema = z.object({
  status: z.string().optional(),
  userId: z.string().uuid().optional(),
  goatedId: z.string().optional(),
  verificationMethod: z.enum(['email', 'transaction', 'support_ticket', 'screenshot', 'other']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export function createLinkingRoutes(
  linkingService: GoatedLinkingService,
  authMiddleware: AuthMiddleware,
  rateLimit: any
): Router {
  const router = Router();

  // ======= USER ROUTES (Authenticated users) =======
  
  // POST /linking/request - Create linking request
  router.post('/request',
    authMiddleware.required,
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 requests per 15 minutes
    validateRequest(CreateLinkingRequestSchema),
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        const requestData = req.body;
        const ipAddress = req.ip;
        const userAgent = req.get('User-Agent');

        const linkingRequest = await linkingService.createLinkingRequest(
          userId,
          {
            claimedGoatedId: requestData.claimedGoatedId,
            claimedGoatedUsername: requestData.claimedGoatedUsername,
            verificationMethod: requestData.verificationMethod,
            verificationData: requestData.verificationData,
            userMessage: requestData.userMessage,
          },
          ipAddress,
          userAgent
        );

        res.status(201).json({
          success: true,
          message: 'Linking request submitted successfully. Please wait for admin review.',
          data: {
            request: {
              id: linkingRequest.id,
              claimedGoatedId: linkingRequest.claimedGoatedId,
              claimedGoatedUsername: linkingRequest.claimedGoatedUsername,
              verificationMethod: linkingRequest.verificationMethod,
              status: linkingRequest.status,
              createdAt: linkingRequest.createdAt,
            },
          },
        });
      } catch (error: any) {
        console.error('Create linking request error:', error);
        
        if (error.message.includes('already have') || error.message.includes('already linked')) {
          return res.status(409).json({
            success: false,
            error: error.message,
            code: 'ALREADY_EXISTS',
          });
        }
        
        if (error.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            error: error.message,
            code: 'ACCOUNT_NOT_FOUND',
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to create linking request',
          code: 'LINKING_REQUEST_ERROR',
        });
      }
    }
  );

  // GET /linking/my-requests - Get current user's linking requests
  router.get('/my-requests',
    authMiddleware.required,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        
        const requests = await linkingService.getUserLinkingHistory(userId);

        res.json({
          success: true,
          data: {
            requests: requests.map(request => ({
              id: request.id,
              claimedGoatedId: request.claimedGoatedId,
              claimedGoatedUsername: request.claimedGoatedUsername,
              verificationMethod: request.verificationMethod,
              status: request.status,
              adminNotes: request.adminNotes,
              rejectionReason: request.rejectionReason,
              createdAt: request.createdAt,
              reviewedAt: request.reviewedAt,
            })),
          },
        });
      } catch (error: any) {
        console.error('Get user linking requests error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get linking requests',
          code: 'GET_REQUESTS_ERROR',
        });
      }
    }
  );

  // ======= ADMIN ROUTES =======
  
  router.use('/admin', authMiddleware.required);
  router.use('/admin', authMiddleware.requireAdmin);
  router.use('/admin', rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 100 }));

  // GET /linking/admin/requests - Get all linking requests (with filters)
  router.get('/admin/requests',
    validateRequest(SearchRequestsSchema, 'query'),
    async (req: Request, res: Response) => {
      try {
        const filters = req.query as any;
        
        // Convert date strings to Date objects if provided
        if (filters.dateFrom) {
          filters.dateFrom = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          filters.dateTo = new Date(filters.dateTo);
        }

        const result = await linkingService.searchRequests(filters);

        res.json({
          success: true,
          data: {
            requests: result.requests.map(request => ({
              id: request.id,
              userId: request.userId,
              claimedGoatedId: request.claimedGoatedId,
              claimedGoatedUsername: request.claimedGoatedUsername,
              verificationMethod: request.verificationMethod,
              userMessage: request.userMessage,
              status: request.status,
              adminNotes: request.adminNotes,
              rejectionReason: request.rejectionReason,
              externalDataVerified: request.externalDataVerified,
              wagerDataMatches: request.wagerDataMatches,
              identityVerified: request.identityVerified,
              createdAt: request.createdAt,
              reviewedAt: request.reviewedAt,
              reviewedBy: request.reviewedBy,
            })),
            total: result.total,
            limit: filters.limit,
            offset: filters.offset,
          },
        });
      } catch (error: any) {
        console.error('Admin search linking requests error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to search linking requests',
          code: 'ADMIN_SEARCH_ERROR',
        });
      }
    }
  );

  // GET /linking/admin/requests/pending - Get pending requests
  router.get('/admin/requests/pending',
    async (req: Request, res: Response) => {
      try {
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const result = await linkingService.getPendingRequests(limit, offset);

        res.json({
          success: true,
          data: {
            requests: result.requests.map(request => ({
              id: request.id,
              userId: request.userId,
              claimedGoatedId: request.claimedGoatedId,
              claimedGoatedUsername: request.claimedGoatedUsername,
              verificationMethod: request.verificationMethod,
              verificationData: request.verificationData,
              userMessage: request.userMessage,
              status: request.status,
              externalDataVerified: request.externalDataVerified,
              wagerDataMatches: request.wagerDataMatches,
              identityVerified: request.identityVerified,
              createdAt: request.createdAt,
            })),
            total: result.total,
            limit,
            offset,
          },
        });
      } catch (error: any) {
        console.error('Get pending requests error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get pending requests',
          code: 'GET_PENDING_ERROR',
        });
      }
    }
  );

  // GET /linking/admin/requests/:id - Get request details with logs
  router.get('/admin/requests/:id',
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        
        const result = await linkingService.getRequestDetails(id);
        
        if (!result.request) {
          return res.status(404).json({
            success: false,
            error: 'Linking request not found',
            code: 'REQUEST_NOT_FOUND',
          });
        }

        res.json({
          success: true,
          data: {
            request: {
              id: result.request.id,
              userId: result.request.userId,
              claimedGoatedId: result.request.claimedGoatedId,
              claimedGoatedUsername: result.request.claimedGoatedUsername,
              verificationMethod: result.request.verificationMethod,
              verificationData: result.request.verificationData,
              userMessage: result.request.userMessage,
              status: result.request.status,
              adminNotes: result.request.adminNotes,
              rejectionReason: result.request.rejectionReason,
              externalDataVerified: result.request.externalDataVerified,
              wagerDataMatches: result.request.wagerDataMatches,
              identityVerified: result.request.identityVerified,
              ipAddress: result.request.ipAddress,
              userAgent: result.request.userAgent,
              createdAt: result.request.createdAt,
              reviewedAt: result.request.reviewedAt,
              reviewedBy: result.request.reviewedBy,
            },
            verificationLogs: result.verificationLogs.map(log => ({
              id: log.id,
              verificationType: log.verificationType,
              verificationResult: log.verificationResult,
              verificationData: log.verificationData,
              errorMessage: log.errorMessage,
              performedBy: log.performedBy,
              performedByType: log.performedByType,
              createdAt: log.createdAt,
            })),
          },
        });
      } catch (error: any) {
        console.error('Get request details error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get request details',
          code: 'GET_DETAILS_ERROR',
        });
      }
    }
  );

  // POST /linking/admin/requests/:id/review - Review a linking request
  router.post('/admin/requests/:id/review',
    validateRequest(AdminReviewRequestSchema.omit({ requestId: true })),
    async (req: Request, res: Response) => {
      try {
        const requestId = req.params.id;
        const reviewData = req.body;
        const adminId = req.user!.id;

        const updatedRequest = await linkingService.reviewLinkingRequest(
          {
            requestId,
            ...reviewData,
          },
          adminId
        );

        res.json({
          success: true,
          message: `Linking request ${reviewData.action}d successfully`,
          data: {
            request: {
              id: updatedRequest.id,
              status: updatedRequest.status,
              adminNotes: updatedRequest.adminNotes,
              rejectionReason: updatedRequest.rejectionReason,
              reviewedAt: updatedRequest.reviewedAt,
              reviewedBy: updatedRequest.reviewedBy,
            },
          },
        });
      } catch (error: any) {
        console.error('Review linking request error:', error);
        
        if (error.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            error: 'Linking request not found',
            code: 'REQUEST_NOT_FOUND',
          });
        }
        
        if (error.message.includes('Cannot review') || error.message.includes('already linked')) {
          return res.status(400).json({
            success: false,
            error: error.message,
            code: 'REVIEW_NOT_ALLOWED',
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to review linking request',
          code: 'REVIEW_ERROR',
        });
      }
    }
  );

  // POST /linking/admin/requests/:id/verify - Automated verification check
  router.post('/admin/requests/:id/verify',
    async (req: Request, res: Response) => {
      try {
        const requestId = req.params.id;
        
        const verificationResult = await linkingService.verifyExternalAccountData(requestId);

        res.json({
          success: true,
          message: 'External verification completed',
          data: {
            verification: verificationResult,
          },
        });
      } catch (error: any) {
        console.error('Verify external account error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to verify external account',
          code: 'VERIFICATION_ERROR',
        });
      }
    }
  );

  // POST /linking/admin/bulk - Bulk operations
  router.post('/admin/bulk',
    validateRequest(AdminBulkOperationSchema),
    async (req: Request, res: Response) => {
      try {
        const bulkData = req.body;
        const adminId = req.user!.id;

        const result = await linkingService.bulkReviewRequests(bulkData, adminId);

        res.json({
          success: true,
          message: `Bulk operation completed: ${result.success} successful, ${result.failed} failed`,
          data: {
            result: {
              success: result.success,
              failed: result.failed,
              errors: result.errors,
            },
          },
        });
      } catch (error: any) {
        console.error('Bulk linking operation error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to perform bulk operation',
          code: 'BULK_OPERATION_ERROR',
        });
      }
    }
  );

  // DELETE /linking/admin/users/:userId/unlink - Unlink a user's account
  router.delete('/admin/users/:userId/unlink',
    validateRequest(AdminUnlinkAccountSchema),
    async (req: Request, res: Response) => {
      try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminId = req.user!.id;

        await linkingService.unlinkGoatedAccount(userId, reason, adminId);

        res.json({
          success: true,
          message: 'Goated account unlinked successfully',
        });
      } catch (error: any) {
        console.error('Unlink account error:', error);
        
        if (error.message.includes('does not have')) {
          return res.status(404).json({
            success: false,
            error: 'User does not have a linked Goated account',
            code: 'NO_LINKED_ACCOUNT',
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to unlink account',
          code: 'UNLINK_ERROR',
        });
      }
    }
  );

  // GET /linking/admin/stats - Get linking statistics
  router.get('/admin/stats',
    async (req: Request, res: Response) => {
      try {
        const stats = await linkingService.getLinkingStats();

        res.json({
          success: true,
          data: {
            stats: {
              ...stats,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      } catch (error: any) {
        console.error('Get linking stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get linking statistics',
          code: 'STATS_ERROR',
        });
      }
    }
  );

  return router;
}