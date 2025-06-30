import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { WagerSyncService } from '../../domain/services/WagerSyncService';
import { DrizzleWagerRepository } from '../../infrastructure/database/DrizzleWagerRepository';
import { DrizzleWagerAdjustmentRepository } from '../../infrastructure/database/DrizzleWagerAdjustmentRepository';
import { UserService } from '../../domain/services/UserService';
import { DrizzleUserRepository } from '../../infrastructure/database/DrizzleUserRepository';
import { MemoryCache } from '../../infrastructure/cache/MemoryCache';

// Response schemas for affiliate data
const AffiliateEntry = z.object({
  uid: z.string(),
  name: z.string(),
  wagered: z.object({
    today: z.number(),
    this_week: z.number(),
    this_month: z.number(),
    all_time: z.number(),
  }),
});

const AffiliateStatsResponse = z.object({
  success: z.boolean(),
  data: z.array(AffiliateEntry),
  metadata: z.object({
    totalUsers: z.number(),
    lastUpdated: z.string(),
    source: z.string(),
  }).optional(),
});

// Query parameters
const AffiliateStatsQuery = z.object({
  timeframe: z.enum(['daily', 'today', 'weekly', 'monthly', 'all_time']).default('all_time'),
  limit: z.coerce.number().min(1).max(100).default(50),
  page: z.coerce.number().min(1).default(1),
});

// Circuit breaker state - Reset to allow fresh requests
let circuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  isOpen: false
};

const CIRCUIT_BREAKER_THRESHOLD = 5; // Allow more retries for intermittent API
const CIRCUIT_BREAKER_TIMEOUT = 120000; // 2 minutes timeout for recovery

export function createAffiliateRoutes(): Router {
  const router = Router();
  
  // Initialize repositories and services for database operations
  const databaseUrl = process.env.DATABASE_URL || '';
  const cacheService = new MemoryCache();
  const wagerRepository = new DrizzleWagerRepository(databaseUrl);
  const wagerAdjustmentRepository = new DrizzleWagerAdjustmentRepository(databaseUrl);
  const userRepository = new DrizzleUserRepository(databaseUrl);
  const userService = new UserService(userRepository, cacheService);
  const wagerSyncService = new WagerSyncService(wagerAdjustmentRepository, userService, cacheService);

  // POST /api/affiliate/sync - Sync wager data from external API to database
  router.post('/sync', 
    rateLimitMiddleware(10, 60000), // 10 requests per minute
    async (req: Request, res: Response) => {
      try {
        console.log('Starting wager data sync...');
        
        // Sync data from external API to database
        const syncResult = await wagerSyncService.syncAllUsers('all_time');
        
        console.log('Wager sync completed:', {
          syncId: syncResult.id,
          status: syncResult.status,
          usersProcessed: syncResult.usersProcessed,
          usersUpdated: syncResult.usersUpdated,
          errors: syncResult.errors
        });
        
        res.json({
          success: true,
          data: syncResult,
          message: 'Wager data synchronized successfully'
        });
        
      } catch (error) {
        console.error('Wager sync error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to sync wager data',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }
  );

  // GET /api/affiliate/stats - Get affiliate leaderboard data from database
  router.get('/stats',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 60 }), // 60 requests per 15 minutes
    validateQuery(AffiliateStatsQuery),
    async (req: Request, res: Response) => {
      try {
        const { timeframe = 'all_time', limit = 10, page = 1 } = req.query;
        console.log('Fetching stats from database...', { timeframe, limit, page });

        // Query computed_wager_stats table for processed data
        const offset = (Number(page) - 1) * Number(limit);
        
        // Get computed stats from database
        const dbStats = await wagerAdjustmentRepository.getComputedLeaderboard(
          timeframe as 'daily' | 'weekly' | 'monthly' | 'all_time',
          Number(limit),
          offset
        );

        console.log(`Database returned ${dbStats.length} computed stats entries`);

        // Transform database results to API format
        const transformedData = dbStats.map((entry, index) => ({
          uid: entry.goatedId,
          name: entry.username,
          wagered: {
            today: entry.finalDailyWager,
            this_week: entry.finalWeeklyWager,
            this_month: entry.finalMonthlyWager,
            all_time: entry.finalAllTimeWager
          },
          rank: entry.dailyRank || entry.weeklyRank || entry.monthlyRank || entry.allTimeRank || (offset + index + 1)
        }));

        const response = AffiliateStatsResponse.parse({
          success: true,
          data: transformedData,
          metadata: {
            totalUsers: transformedData.length,
            lastUpdated: new Date().toISOString(),
            source: 'database',
            timeframe: timeframe as string,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(transformedData.length / Number(limit))
          }
        });

        res.json(response);

      } catch (error) {
        console.error('Database stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch stats from database',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }
          }

          console.log(`Processing ${affiliateData.length} affiliate entries`);

          // Transform and validate data
          const processedData = affiliateData.map((entry: any, index: number) => ({
            uid: String(entry.uid || entry.id || entry.user_id || `user_${index}`),
            name: String(entry.name || entry.username || entry.display_name || `User ${index + 1}`),
            wagered: {
              today: Number(entry.wagered?.today || entry.today || entry.daily_wagered || 0),
              this_week: Number(entry.wagered?.this_week || entry.weekly || entry.weekly_wagered || 0),
              this_month: Number(entry.wagered?.this_month || entry.monthly || entry.monthly_wagered || 0),
              all_time: Number(entry.wagered?.all_time || entry.total || entry.total_wagered || 0),
            }
          }));

          // Apply pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedData = processedData.slice(startIndex, endIndex);

          // Add rank to each entry
          const rankedData = paginatedData.map((entry: any, index: number) => ({
            ...entry,
            rank: startIndex + index + 1,
          }));

          // Return formatted response
          res.json({
            success: true,
            data: rankedData,
            metadata: {
              totalUsers: affiliateData.length,
              lastUpdated: new Date().toISOString(),
              source: 'goated_api',
              timeframe,
              page,
              limit,
              totalPages: Math.ceil(affiliateData.length / limit),
            },
          });

          // Reset failure count on success
          circuitBreakerState.failures = 0;

        } catch (error: any) {
          console.error('Affiliate stats error:', error);

          // Update circuit breaker on failure
          circuitBreakerState.failures++;
          circuitBreakerState.lastFailure = Date.now();

          if (circuitBreakerState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
            circuitBreakerState.isOpen = true;
            console.log('Circuit breaker opened due to repeated failures');
          }

          // Check if it's an external API error (503)
          if (error instanceof Error && error.message.includes('503')) {
            res.status(503).json({
              status: 'error',
              error: 'External API temporarily unavailable',
              message: 'The Goated.com API is currently experiencing issues. Please try again later.',
              retryAfter: 60
            });
          } else {
            res.status(500).json({
              status: 'error',
              error: 'Failed to fetch affiliate stats',
              message: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

      } catch (error: any) {
        console.error('Affiliate route error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch affiliate stats',
          code: 'AFFILIATE_STATS_ERROR',
          message: error.message,
        });
      }
    }
  );

  // GET /api/affiliate/top-performers - Get top performers across all timeframes
  router.get('/top-performers',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 60 }),
    async (req: Request, res: Response) => {
      try {
        const apiUrl = process.env.GOATED_API_URL || 'https://apis.goated.com/user/affiliate/referral-leaderboard/2RW440E';
        const apiToken = process.env.GOATED_API_TOKEN;

        if (!apiUrl || !apiToken) {
          return res.status(500).json({
            success: false,
            error: 'External API credentials not configured',
            code: 'MISSING_API_CONFIG',
          });
        }

        const response = await fetch('https://apis.goated.com/user/affiliate/referral-leaderboard/2RW440E', {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'GoatedVIPs/2.0',
          },
          signal: AbortSignal.timeout(21000),
        });

        if (!response.ok) {
          throw new Error(`External API error: ${response.status}`);
        }

        const externalData = await response.json();
        const affiliateData = externalData.data || externalData || [];

        // Get top performer for each timeframe
        const topPerformers = {
          today: affiliateData.reduce((max: any, current: any) => 
            current.wagered.today > (max?.wagered?.today || 0) ? current : max, null),
          weekly: affiliateData.reduce((max: any, current: any) => 
            current.wagered.this_week > (max?.wagered?.this_week || 0) ? current : max, null),
          monthly: affiliateData.reduce((max: any, current: any) => 
            current.wagered.this_month > (max?.wagered?.this_month || 0) ? current : max, null),
          all_time: affiliateData.reduce((max: any, current: any) => 
            current.wagered.all_time > (max?.wagered?.all_time || 0) ? current : max, null),
        };

        res.json({
          success: true,
          data: topPerformers,
          metadata: {
            totalUsers: affiliateData.length,
            lastUpdated: new Date().toISOString(),
            source: 'goated_api',
          },
        });

      } catch (error: any) {
        console.error('Top performers error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch top performers',
          code: 'TOP_PERFORMERS_ERROR',
          message: error.message,
        });
      }
    }
  );

  return router;
}