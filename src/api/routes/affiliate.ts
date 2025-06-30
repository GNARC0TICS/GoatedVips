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
  timeframe: z.enum(['today', 'weekly', 'monthly', 'all_time']).default('all_time'),
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
        const apiUrl = process.env.API_BASE_URL || process.env.GOATED_API_URL || 'https://apis.goated.com/user/affiliate/referral-leaderboard/2RW440E';
        const apiToken = process.env.GOATED_API_TOKEN || process.env.GOATED_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJNZ2xjTU9DNEl6cWpVbzVhTXFBVyIsInNlc3Npb24iOiJ5MmNBM0Nva05WdmgiLCJpYXQiOjE3NTEyNTM1NzgsImV4cCI6MTc1MTMzOTk3OH0.woqA7k83flLSO2w3zZWS5pctt6_ybOryj6hXlzZzJiw';
        
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

        // Fetch data from Goated.com API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'GoatedVIPs/2.0',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`External API error: ${response.status} ${response.statusText}`);
        }

        const externalData = await response.json();
        
        // Process and transform the data
        const affiliateData = externalData.data || [];
        
        // Sort by the requested timeframe
        let sortedData = affiliateData;
        switch (timeframe) {
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

      } catch (error: any) {
        console.error('Affiliate stats error:', error);
        
        if (error.name === 'AbortError') {
          return res.status(504).json({
            success: false,
            error: 'External API timeout',
            code: 'API_TIMEOUT',
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to fetch affiliate stats',
          code: 'AFFILIATE_ERROR',
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