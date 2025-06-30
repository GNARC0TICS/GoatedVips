import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rateLimit';

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

export function createAffiliateRoutes(): Router {
  const router = Router();

  // GET /api/affiliate/stats - Get affiliate leaderboard data
  router.get('/stats',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 60 }), // 60 requests per 15 minutes
    validateQuery(AffiliateStatsQuery),
    async (req: Request, res: Response) => {
      try {
        const { timeframe, limit, page } = req.query as any;

        // Get API credentials from environment
        const apiUrl = process.env.GOATED_API_URL || process.env.API_BASE_URL || 'https://apis.goated.com/user/affiliate/referral-leaderboard/2RW440E';
        const apiToken = process.env.API_TOKEN || process.env.GOATED_API_TOKEN || process.env.GOATED_API_KEY;

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

        // Circuit breaker for external API
        let circuitBreakerState = {
          failures: 0,
          lastFailure: 0,
          isOpen: false
        };

        const CIRCUIT_BREAKER_THRESHOLD = 5;
        const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds

          const { timeframe: queryTimeframe = 'daily', limit: queryLimit = '10', page: queryPage = '1' } = req.query;

          console.log('Fetching affiliate stats...', {
            timeframe: queryTimeframe,
            limit: queryLimit,
            page: queryPage
          });

          // Check circuit breaker
          const now = Date.now();
          if (circuitBreakerState.isOpen) {
            if (now - circuitBreakerState.lastFailure < CIRCUIT_BREAKER_TIMEOUT) {
              return res.status(503).json({
                status: 'error',
                error: 'External API temporarily unavailable',
                message: 'Circuit breaker is open, please try again later',
                retryAfter: Math.ceil((CIRCUIT_BREAKER_TIMEOUT - (now - circuitBreakerState.lastFailure)) / 1000)
              });
            } else {
              // Reset circuit breaker
              circuitBreakerState.isOpen = false;
              circuitBreakerState.failures = 0;
            }
          }

        // Fetch data from Goated.com API with retry logic for 503 errors
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 21000); // 21 seconds timeout

        let fetchResponse: globalThis.Response;
        try {
          console.log(`Making API request to: ${apiUrl}`);
          console.log(`Using token: ${apiToken.substring(0, 20)}...`);

          fetchResponse = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
              'User-Agent': 'GoatedVIPs/2.0',
              'Accept': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log(`API Response status: ${fetchResponse.status} ${fetchResponse.statusText}`);

          if (!fetchResponse.ok) {
            const errorText = await fetchResponse.text().catch(() => 'No response body');
            console.log(`API Error response: ${errorText}`);

            // For 503 errors, return cached data or graceful fallback
            if (fetchResponse.status === 503) {
                console.log('External API service unavailable (503), returning graceful fallback');
                // Return properly structured response that matches frontend expectations
                return res.json({
                  success: true,
                  data: [],
                  metadata: {
                    totalUsers: 0,
                    lastUpdated: new Date().toISOString(),
                    source: 'fallback_503',
                    timeframe,
                    page,
                    limit,
                    totalPages: 0,
                    serviceStatus: 'unavailable'
                  },
                });
            }
            throw new Error(`External API error: ${fetchResponse.status} ${fetchResponse.statusText} - ${errorText}`);
          }
        } catch (error: any) {
          clearTimeout(timeoutId);

          if (error.name === 'AbortError') {
            console.log('API request timed out after 21 seconds');
            throw new Error('External API request timed out after 21 seconds');
          }

          console.error('API request failed:', {
            error: error.message,
            endpoint: apiUrl,
            timeframe,
            timestamp: new Date().toISOString(),
            stack: error.stack
          });
          throw error;
        }

        const externalData = await fetchResponse.json();
        console.log(`API Response data length: ${externalData.data?.length || 0}`);

        // Process and transform the data
        const affiliateData = externalData.data || [];

        // Sort by the requested timeframe (map 'daily' to 'today' for consistency)
        let sortedData = affiliateData;
        const normalizedTimeframe = timeframe === 'daily' ? 'today' : timeframe;

        switch (normalizedTimeframe) {
          case 'today':
            sortedData = affiliateData.sort((a: any, b: any) => b.wagered.today - a.wagered.today);
            break;
          case 'weekly':
            sortedData = affiliateData.sort((a: any, b: any) => b.wagered.this_week - a.wagered.this_week);
            break;
          case 'monthly':
            sortedData = affiliateData.sort((a: any, b: any) => b.wagered.this_month - a.wagered.this_month);
            break;
          case 'all_time':
          default:
            sortedData = affiliateData.sort((a: any, b: any) => b.wagered.all_time - a.wagered.all_time);
            break;
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = sortedData.slice(startIndex, endIndex);

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
      }
    }
  );

  // GET /api/affiliate/top-performers - Get top performers across all timeframes
  router.get('/top-performers',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 60 }),
    async (req: Request, res: Response) => {
      try {
        const apiUrl = process.env.API_BASE_URL || process.env.GOATED_API_URL;
        const apiToken = process.env.GOATED_API_TOKEN || process.env.GOATED_API_KEY;

        if (!apiUrl || !apiToken) {
          return res.status(500).json({
            success: false,
            error: 'External API credentials not configured',
            code: 'MISSING_API_CONFIG',
          });
        }

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'GoatedVIPs/2.0',
          },
        });

        if (!response.ok) {
          throw new Error(`External API error: ${response.status}`);
        }

        const externalData = await response.json();
        const affiliateData = externalData.data || [];

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