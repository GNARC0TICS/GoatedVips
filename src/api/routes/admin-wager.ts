import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { WagerAdjustmentService } from '../../domain/services/WagerAdjustmentService';
import { WagerSyncService } from '../../domain/services/WagerSyncService';
import { AuthMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { 
  CreateAdjustmentInput, 
  BulkAdjustmentInput, 
  RevertAdjustmentInput,
  WagerTimeframe 
} from '../../domain/entities/WagerAdjustment';

// Request schemas for admin wager operations
const AdminCreateAdjustmentSchema = CreateAdjustmentInput.extend({
  adminNotes: z.string().optional(),
});

const AdminBulkAdjustmentSchema = BulkAdjustmentInput;

const AdminRevertAdjustmentSchema = RevertAdjustmentInput;

const AdminSyncUserSchema = z.object({
  goatedId: z.string().min(1),
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'all_time']).default('monthly'),
});

const AdminSearchAdjustmentsSchema = z.object({
  goatedId: z.string().optional(),
  adminId: z.string().uuid().optional(),
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'all_time']).optional(),
  status: z.enum(['active', 'reverted']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export function createAdminWagerRoutes(
  wagerAdjustmentService: WagerAdjustmentService,
  wagerSyncService: WagerSyncService,
  authMiddleware: AuthMiddleware,
  rateLimit: any
): Router {
  const router = Router();

  // All admin wager routes require authentication and admin role
  router.use(authMiddleware.required);
  router.use(authMiddleware.requireAdmin);

  // Stricter rate limiting for wager operations
  router.use(rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 50 })); // 50 requests per 15 minutes

  // POST /admin/wager/adjustments - Create single adjustment
  router.post('/adjustments',
    validateRequest(AdminCreateAdjustmentSchema),
    async (req: Request, res: Response) => {
      try {
        const adjustmentData = req.body;
        const adminId = req.user!.id;
        const ipAddress = req.ip;
        const userAgent = req.get('User-Agent');

        const adjustment = await wagerAdjustmentService.createAdjustment(
          adjustmentData,
          adminId,
          ipAddress,
          userAgent
        );

        res.status(201).json({
          success: true,
          message: 'Wager adjustment created successfully',
          data: {
            adjustment: {
              id: adjustment.id,
              goatedId: adjustment.goatedId,
              adjustmentType: adjustment.adjustmentType,
              appliedToTimeframe: adjustment.appliedToTimeframe,
              reason: adjustment.reason,
              originalValue: adjustment.originalValue,
              newValue: adjustment.newValue,
              createdAt: adjustment.createdAt,
            },
          },
        });
      } catch (error: any) {
        console.error('Create wager adjustment error:', error);
        
        if (error.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            error: error.message,
            code: 'USER_NOT_FOUND',
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to create wager adjustment',
          code: 'ADJUSTMENT_CREATE_ERROR',
        });
      }
    }
  );

  // POST /admin/wager/adjustments/bulk - Create multiple adjustments
  router.post('/adjustments/bulk',
    validateRequest(AdminBulkAdjustmentSchema),
    async (req: Request, res: Response) => {
      try {
        const bulkData = req.body;
        const adminId = req.user!.id;
        const ipAddress = req.ip;
        const userAgent = req.get('User-Agent');

        const adjustments = await wagerAdjustmentService.createBulkAdjustments(
          bulkData,
          adminId,
          ipAddress,
          userAgent
        );

        res.status(201).json({
          success: true,
          message: `${adjustments.length} wager adjustments created successfully`,
          data: {
            adjustments: adjustments.map(adj => ({
              id: adj.id,
              goatedId: adj.goatedId,
              adjustmentType: adj.adjustmentType,
              appliedToTimeframe: adj.appliedToTimeframe,
              originalValue: adj.originalValue,
              newValue: adj.newValue,
            })),
            count: adjustments.length,
          },
        });
      } catch (error: any) {
        console.error('Create bulk wager adjustments error:', error);
        
        if (error.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            error: error.message,
            code: 'USER_NOT_FOUND',
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to create bulk wager adjustments',
          code: 'BULK_ADJUSTMENT_ERROR',
        });
      }
    }
  );

  // POST /admin/wager/adjustments/:id/revert - Revert an adjustment
  router.post('/adjustments/:id/revert',
    validateRequest(AdminRevertAdjustmentSchema.omit({ adjustmentId: true })),
    async (req: Request, res: Response) => {
      try {
        const adjustmentId = req.params.id;
        const { reason } = req.body;
        const adminId = req.user!.id;

        const revertedAdjustment = await wagerAdjustmentService.revertAdjustment(
          { adjustmentId, reason },
          adminId
        );

        res.json({
          success: true,
          message: 'Wager adjustment reverted successfully',
          data: {
            adjustment: {
              id: revertedAdjustment.id,
              status: revertedAdjustment.status,
              revertedAt: revertedAdjustment.revertedAt,
              revertedBy: revertedAdjustment.revertedBy,
            },
          },
        });
      } catch (error: any) {
        console.error('Revert wager adjustment error:', error);
        
        if (error.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            error: 'Adjustment not found',
            code: 'ADJUSTMENT_NOT_FOUND',
          });
        }
        
        if (error.message.includes('already reverted')) {
          return res.status(400).json({
            success: false,
            error: 'Adjustment is already reverted',
            code: 'ALREADY_REVERTED',
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to revert wager adjustment',
          code: 'ADJUSTMENT_REVERT_ERROR',
        });
      }
    }
  );

  // GET /admin/wager/adjustments - Search adjustments
  router.get('/adjustments',
    validateRequest(AdminSearchAdjustmentsSchema, 'query'),
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

        const result = await wagerAdjustmentService.searchAdjustments(filters);

        res.json({
          success: true,
          data: {
            adjustments: result.adjustments.map(adj => ({
              id: adj.id,
              goatedId: adj.goatedId,
              adminId: adj.adminId,
              adjustmentType: adj.adjustmentType,
              appliedToTimeframe: adj.appliedToTimeframe,
              reason: adj.reason,
              originalValue: adj.originalValue,
              newValue: adj.newValue,
              status: adj.status,
              isActive: adj.isActive,
              createdAt: adj.createdAt,
              revertedAt: adj.revertedAt,
            })),
            total: result.total,
            limit: filters.limit,
            offset: filters.offset,
          },
        });
      } catch (error: any) {
        console.error('Search wager adjustments error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to search wager adjustments',
          code: 'ADJUSTMENT_SEARCH_ERROR',
        });
      }
    }
  );

  // GET /admin/wager/users/:goatedId/adjustments - Get user's adjustments
  router.get('/users/:goatedId/adjustments',
    async (req: Request, res: Response) => {
      try {
        const { goatedId } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const result = await wagerAdjustmentService.getUserAdjustments(goatedId, limit, offset);

        res.json({
          success: true,
          data: {
            adjustments: result.adjustments.map(adj => ({
              id: adj.id,
              adminId: adj.adminId,
              adjustmentType: adj.adjustmentType,
              appliedToTimeframe: adj.appliedToTimeframe,
              reason: adj.reason,
              originalValue: adj.originalValue,
              newValue: adj.newValue,
              status: adj.status,
              createdAt: adj.createdAt,
              revertedAt: adj.revertedAt,
              adminNotes: adj.adminNotes,
            })),
            total: result.total,
            limit,
            offset,
          },
        });
      } catch (error: any) {
        console.error('Get user adjustments error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get user adjustments',
          code: 'USER_ADJUSTMENTS_ERROR',
        });
      }
    }
  );

  // GET /admin/wager/users/:goatedId/stats - Get user's computed stats
  router.get('/users/:goatedId/stats',
    async (req: Request, res: Response) => {
      try {
        const { goatedId } = req.params;
        
        // First find the user to get their ID
        const user = await wagerAdjustmentService.userService.findByGoatedId(goatedId);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
            code: 'USER_NOT_FOUND',
          });
        }

        const computedStats = await wagerAdjustmentService.getComputedWagerStats(user.id);

        res.json({
          success: true,
          data: {
            stats: computedStats ? {
              goatedId: computedStats.goatedId,
              username: computedStats.username,
              rawWagers: {
                daily: computedStats.rawDailyWager,
                weekly: computedStats.rawWeeklyWager,
                monthly: computedStats.rawMonthlyWager,
                allTime: computedStats.rawAllTimeWager,
              },
              adjustments: {
                daily: computedStats.totalDailyAdjustment,
                weekly: computedStats.totalWeeklyAdjustment,
                monthly: computedStats.totalMonthlyAdjustment,
                allTime: computedStats.totalAllTimeAdjustment,
              },
              finalWagers: {
                daily: computedStats.finalDailyWager,
                weekly: computedStats.finalWeeklyWager,
                monthly: computedStats.finalMonthlyWager,
                allTime: computedStats.finalAllTimeWager,
              },
              ranks: {
                daily: computedStats.dailyRank,
                weekly: computedStats.weeklyRank,
                monthly: computedStats.monthlyRank,
                allTime: computedStats.allTimeRank,
              },
              hasAdjustments: computedStats.hasAdjustments,
              adjustmentCount: computedStats.adjustmentCount,
              lastApiSync: computedStats.lastApiSync,
              lastAdjustment: computedStats.lastAdjustment,
            } : null,
          },
        });
      } catch (error: any) {
        console.error('Get user computed stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get user computed stats',
          code: 'USER_STATS_ERROR',
        });
      }
    }
  );

  // POST /admin/wager/sync - Trigger manual sync
  router.post('/sync',
    async (req: Request, res: Response) => {
      try {
        const timeframe = (req.body.timeframe as WagerTimeframe) || 'monthly';
        
        const syncLog = await wagerSyncService.syncAllUsers(timeframe);

        res.json({
          success: true,
          message: 'Wager sync completed successfully',
          data: {
            syncLog: {
              id: syncLog.id,
              syncType: syncLog.syncType,
              timeframe: syncLog.timeframe,
              usersProcessed: syncLog.usersProcessed,
              usersUpdated: syncLog.usersUpdated,
              usersAdded: syncLog.usersAdded,
              errors: syncLog.errors,
              duration: syncLog.duration,
              apiStatus: syncLog.apiStatus,
            },
          },
        });
      } catch (error: any) {
        console.error('Manual wager sync error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to sync wager data',
          code: 'SYNC_ERROR',
        });
      }
    }
  );

  // POST /admin/wager/users/:goatedId/sync - Sync specific user
  router.post('/users/:goatedId/sync',
    validateRequest(AdminSyncUserSchema.omit({ goatedId: true })),
    async (req: Request, res: Response) => {
      try {
        const { goatedId } = req.params;
        const { timeframe } = req.body;

        const apiUser = await wagerSyncService.syncUser(goatedId, timeframe);
        
        if (!apiUser) {
          return res.status(404).json({
            success: false,
            error: 'User not found in external API',
            code: 'USER_NOT_FOUND_IN_API',
          });
        }

        res.json({
          success: true,
          message: 'User sync completed successfully',
          data: {
            user: {
              goatedId: apiUser.uid,
              username: apiUser.name,
              wagers: apiUser.wagered,
              rank: apiUser.rank,
            },
          },
        });
      } catch (error: any) {
        console.error('User sync error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to sync user data',
          code: 'USER_SYNC_ERROR',
        });
      }
    }
  );

  // GET /admin/wager/stats - Get adjustment statistics
  router.get('/stats',
    async (req: Request, res: Response) => {
      try {
        const timeframe = (req.query.timeframe as 'day' | 'week' | 'month') || 'day';
        
        const stats = await wagerAdjustmentService.getAdjustmentStats(timeframe);

        res.json({
          success: true,
          data: {
            stats: {
              ...stats,
              timeframe,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      } catch (error: any) {
        console.error('Get adjustment stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get adjustment statistics',
          code: 'STATS_ERROR',
        });
      }
    }
  );

  return router;
}