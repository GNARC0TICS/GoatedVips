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
  const wagerRepository = new DrizzleWagerRepository(databaseUrl);
  const wagerAdjustmentRepository = new DrizzleWagerAdjustmentRepository(databaseUrl);
  const userRepository = new DrizzleUserRepository(databaseUrl);
  const cacheService = new MemoryCache();
  const userService = new UserService(userRepository, cacheService);
  const wagerSyncService = new WagerSyncService(wagerAdjustmentRepository, userService, cacheService);

  // GET /api/affiliate/stats - Get affiliate leaderboard data
  router.get('/stats',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 60 }), // 60 requests per 15 minutes
    validateQuery(AffiliateStatsQuery),
    async (req: Request, res: Response) => {
      try {
        const { timeframe, limit, page } = req.query as any;

        // Get API credentials from environment
        const apiUrl = process.env.GOATED_API_URL || 'https://apis.goated.com/user/affiliate/referral-leaderboard/2RW440E';
        const apiToken = process.env.GOATED_API_TOKEN;

        console.log('Fetching affiliate data...', { 
          hasUrl: !!apiUrl, 
          hasToken: !!apiToken, 
          url: apiUrl?.substring(0, 50) + '...',
          tokenPrefix: apiToken?.substring(0, 20) + '...' 
        });

        if (!apiUrl || !apiToken) {
          return res.status(500).json({
            success: false,
            error: 'External API credentials not configured',
            code: 'MISSING_API_CONFIG',
          });
        }

        console.log('Fetching affiliate stats...', {
          timeframe,
          limit,
          page
        });

        // Check circuit breaker
        const now = Date.now();
        if (circuitBreakerState.isOpen) {
          if (now - circuitBreakerState.lastFailure < CIRCUIT_BREAKER_TIMEOUT) {
            return res.status(503).json({
              success: false,
              error: 'External API temporarily unavailable',
              message: 'Circuit breaker is open, please try again later',
              retryAfter: Math.ceil((CIRCUIT_BREAKER_TIMEOUT - (now - circuitBreakerState.lastFailure)) / 1000),
              metadata: {
                failures: circuitBreakerState.failures,
                lastFailure: new Date(circuitBreakerState.lastFailure).toISOString(),
                nextRetryTime: new Date(circuitBreakerState.lastFailure + CIRCUIT_BREAKER_TIMEOUT).toISOString()
              }
            });
          } else {
            // Reset circuit breaker
            circuitBreakerState.isOpen = false;
            circuitBreakerState.failures = 0;
            console.log('Circuit breaker reset - attempting reconnection');
          }
        }

        // Fetch data from Goated.com API with extended timeout for large datasets
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds for large responses

        let fetchResponse: globalThis.Response;
        try {
          console.log(`Making API request to: ${apiUrl}`);
          console.log(`Using token: ${apiToken.substring(0, 20)}...`);

          fetchResponse = await fetch('https://apis.goated.com/user/affiliate/referral-leaderboard/2RW440E', {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
              'User-Agent': 'GoatedVIPs/2.0',
              'Accept': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log(`API Response: ${fetchResponse.status} ${fetchResponse.statusText}`);

          if (!fetchResponse.ok) {
            throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
          }

          const externalData = await fetchResponse.json();
          console.log('External API response received:', {
            hasData: !!externalData,
            dataType: typeof externalData,
            isArray: Array.isArray(externalData),
            hasDataProp: !!externalData?.data,
            dataCount: externalData?.data?.length || 0
          });

          // Handle different response formats
          let affiliateData = [];
          if (externalData && Array.isArray(externalData)) {
            affiliateData = externalData;
          } else if (externalData && externalData.data && Array.isArray(externalData.data)) {
            affiliateData = externalData.data;
          } else if (externalData && externalData.users && Array.isArray(externalData.users)) {
            affiliateData = externalData.users;
          } else {
            console.warn('Unexpected API response format:', externalData);
            affiliateData = [];
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