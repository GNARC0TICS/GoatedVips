import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validation';

const router = Router();

// Query validation schema
const RaceConfigQuery = z.object({
  type: z.enum(['monthly', 'weekly', 'daily']).optional().default('monthly'),
});

// Static race configuration - in production this would come from a database
const RACE_CONFIGS = {
  monthly: {
    name: "Monthly Wager Race",
    description: "Compete with other players to wager the most this month and win big prizes!",
    prizePool: 10000, // $10,000
    currency: "USD",
    timeframe: "monthly",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString(),
    nextRaceStartDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    status: "active" as const,
    prizeDistribution: {
      "1": 0.425,  // 42.5% - $4,250
      "2": 0.2,    // 20% - $2,000
      "3": 0.125,  // 12.5% - $1,250
      "4": 0.075,  // 7.5% - $750
      "5": 0.05,   // 5% - $500
      "6": 0.035,  // 3.5% - $350
      "7": 0.025,  // 2.5% - $250
      "8": 0.02,   // 2% - $200
      "9": 0.02,   // 2% - $200
      "10": 0.0225, // 2.25% - $225
    },
    totalWinners: 10,
  },
  weekly: {
    name: "Weekly Wager Race",
    description: "Weekly competition for the biggest wagers!",
    prizePool: 2500,
    currency: "USD", 
    timeframe: "weekly",
    startDate: getWeekStart().toISOString(),
    endDate: getWeekEnd().toISOString(),
    nextRaceStartDate: getNextWeekStart().toISOString(),
    status: "active" as const,
    prizeDistribution: {
      "1": 0.5,   // 50%
      "2": 0.3,   // 30%
      "3": 0.2,   // 20%
    },
    totalWinners: 3,
  }
};

function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  return new Date(now.setDate(diff));
}

function getWeekEnd(): Date {
  const weekStart = getWeekStart();
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000);
}

function getNextWeekStart(): Date {
  const weekStart = getWeekStart();
  return new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
}

/**
 * GET /api/race-config
 * Returns the current race configuration
 */
router.get('/',
  validateQuery(RaceConfigQuery),
  async (req: Request, res: Response) => {
    try {
      const { type } = req.query as z.infer<typeof RaceConfigQuery>;
      
      const config = RACE_CONFIGS[type];
      
      if (!config) {
        res.status(404).json({
          success: false,
          error: 'Race configuration not found',
        });
        return;
      }

      // Check if race should be in transition or ended state
      const now = new Date();
      const endDate = new Date(config.endDate);
      const nextRaceStart = new Date(config.nextRaceStartDate);
      
      let status = config.status;
      if (now > endDate && now < nextRaceStart) {
        status = 'transition';
      } else if (now >= nextRaceStart) {
        status = 'upcoming';
      }

      const response = {
        success: true,
        data: {
          ...config,
          status,
        },
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      console.error('Race config fetch error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to fetch race configuration',
      });
    }
  }
);

export function createRaceConfigRoutes(): Router {
  return router;
}