/**
 * User Profile Routes
 * 
 * API routes for handling user profile operations:
 * - Fetching user profiles
 * - Ensuring profiles exist
 * - Profile updates
 * - User stats retrieval
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '@db';
import { users } from '@db/schema';
import { eq, like, or, and, not, sql } from 'drizzle-orm';
import { ensureUserProfile } from '../index';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { z } from 'zod';

const router = Router();

/**
 * Error handling middleware
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error in user routes:', err);
  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred';
  res.status(status).json({
    error: {
      status,
      message
    }
  });
};

/**
 * Search users by username with pagination support
 * NOTE: This route needs to be defined BEFORE the '/:id' route to avoid conflicts
 */
router.get('/search', async (req, res) => {
  try {
    const query = req.query.username as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100); // Default 30, max 100
    const offset = (page - 1) * limit;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    // Prepare conditions for username search
    const searchCondition = or(
      like(users.username, `%${query}%`),
      like(users.goatedUsername, `%${query}%`)
    );

    // Get total count for pagination
    const countResult = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .where(searchCondition);
    
    const totalCount = countResult[0]?.count || 0;

    // Execute search with pagination
    const results = await db.select({
      id: users.id,
      username: users.username,
      profileColor: users.profileColor,
      goatedId: users.goatedId,
      goatedUsername: users.goatedUsername,
    })
    .from(users)
    .where(searchCondition)
    .orderBy(
      sql`
        CASE 
          WHEN username = ${query} THEN 1
          WHEN goated_username = ${query} THEN 1
          WHEN username ILIKE ${query + '%'} THEN 2
          WHEN goated_username ILIKE ${query + '%'} THEN 2
          ELSE 3
        END
      `
    )
    .limit(limit)
    .offset(offset);

    // Return with pagination metadata
    return res.json({
      results,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({ error: 'Failed to search users' });
  }
});

/**
 * Get user by ID (from our database)
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if userId is a valid number
    const isNumericId = /^\d+$/.test(userId);
    
    // First try to find user by internal ID (only if it's a valid number)
    let user = null;
    if (isNumericId) {
      user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(userId)),
        columns: {
          id: true,
          username: true,
          bio: true,
          profileColor: true,
          goatedId: true,
          goatedUsername: true,
          goatedAccountLinked: true,
          createdAt: true,
          totalWager: true,
          dailyWager: true,
          weeklyWager: true,
          monthlyWager: true,
          lastWagerSync: true,
          lastUpdated: true
        }
      });
    }

    // If not found by ID, try to find by goatedId
    if (!user) {
      user = await db.query.users.findFirst({
        where: eq(users.goatedId, userId),
        columns: {
          id: true,
          username: true,
          bio: true,
          profileColor: true,
          goatedId: true,
          goatedUsername: true,
          goatedAccountLinked: true,
          createdAt: true,
          totalWager: true,
          dailyWager: true,
          weeklyWager: true,
          monthlyWager: true,
          lastWagerSync: true,
          lastUpdated: true
        }
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format the response with wager data directly from users table
    const userProfile = {
      id: user.id.toString(),
      username: user.username,
      bio: user.bio || 'No bio available',
      profileColor: user.profileColor || '#D7FF00',
      createdAt: user.createdAt,
      goatedId: user.goatedId,
      goatedUsername: user.goatedUsername,
      goatedAccountLinked: user.goatedAccountLinked,
      totalWager: user.totalWager || '0',
      // Add wager object with all time periods
      wager: {
        all_time: user.totalWager ? parseFloat(user.totalWager) : 0,
        monthly: user.monthlyWager ? parseFloat(user.monthlyWager) : 0,
        weekly: user.weeklyWager ? parseFloat(user.weeklyWager) : 0,
        daily: user.dailyWager ? parseFloat(user.dailyWager) : 0
      },
      lastWagerSync: user.lastWagerSync
    };

    return res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

/**
 * Get leaderboard data from our database
 */
router.get('/leaderboard/:timeframe', async (req, res) => {
  try {
    const timeframe = req.params.timeframe || 'all_time';
    let wagerField;

    // Determine which field to use for sorting based on timeframe
    switch (timeframe) {
      case 'daily':
        wagerField = 'daily_wager';
        break;
      case 'weekly':
        wagerField = 'weekly_wager';
        break;
      case 'monthly':
        wagerField = 'monthly_wager';
        break;
      case 'all_time':
      default:
        wagerField = 'total_wager';
    }

    // Query our database for the top wagers in the specified timeframe using real data
    const results = await db.execute(sql`
      SELECT 
        id, 
        username, 
        profile_color as "profileColor",
        goated_id as "goatedId",
        ${sql.raw(wagerField)} as "wagerAmount"
      FROM 
        users
      WHERE 
        ${sql.raw(wagerField)} IS NOT NULL AND
        CAST(${sql.raw(wagerField)} AS DECIMAL) > 0
      ORDER BY 
        CAST(${sql.raw(wagerField)} AS DECIMAL) DESC
      LIMIT 100
    `);

    // Format the response
    const leaderboard = results.rows.map((user: any, index: number) => ({
      rank: index + 1,
      id: user.id,
      username: user.username,
      profileColor: user.profileColor,
      goatedId: user.goatedId,
      wager: parseFloat(user.wagerAmount) || 0
    }));

    return res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

/**
 * Administrative endpoints (require admin access)
 */

// Get all users (admin only)
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const results = await db.select()
      .from(users)
      .limit(limit)
      .offset(offset);

    const totalResult = await db.select({ count: sql`count(*)::int` })
      .from(users);

    // Use type assertion for the count result
    const count = (totalResult[0]?.count as number) || 0;

    return res.json({
      users: results,
      pagination: {
        page,
        limit,
        total: count
      }
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});


/**
 * Ensure a user profile exists
 */
router.post('/ensure-profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      userId: z.string()
    });
    const { userId } = schema.parse(req.body);
    const result = await ensureUserProfile(userId);
    if (!result) {
      return res.status(404).json({ 
        success: false,
        error: 'Could not find or create user profile'
      });
    }
    res.json({
      success: true,
      id: result.id,
      username: result.username,
      goatedId: result.goatedId,
      isNewlyCreated: result.isNewlyCreated
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get user stats
 */
router.get('/:id/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    
    // Check if userId is numeric or a goatedId
    const isNumericId = /^\d+$/.test(userId);
    
    // Query for the user based on ID type
    let user;
    if (isNumericId) {
      user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(userId)),
        columns: {
          id: true,
          totalWager: true,
          dailyWager: true,
          weeklyWager: true,
          monthlyWager: true
        }
      });
    } else {
      user = await db.query.users.findFirst({
        where: eq(users.goatedId, userId),
        columns: {
          id: true,
          totalWager: true,
          dailyWager: true,
          weeklyWager: true,
          monthlyWager: true
        }
      });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate tier based on wager amount
    // This is a simple placeholder logic that can be expanded
    const allTimeWager = user.totalWager ? parseFloat(user.totalWager) : 0;
    let tier = 'BRONZE';
    
    if (allTimeWager >= 1000000) {
      tier = 'DIAMOND';
    } else if (allTimeWager >= 500000) {
      tier = 'PLATINUM';
    } else if (allTimeWager >= 100000) {
      tier = 'GOLD';
    } else if (allTimeWager >= 10000) {
      tier = 'SILVER';
    }
    
    // Return real stats from the database
    const stats = {
      currentWager: user.dailyWager ? parseFloat(user.dailyWager) : 0,
      today: user.dailyWager ? parseFloat(user.dailyWager) : 0,
      thisWeek: user.weeklyWager ? parseFloat(user.weeklyWager) : 0,
      thisMonth: user.monthlyWager ? parseFloat(user.monthlyWager) : 0,
      allTime: allTimeWager,
      tier
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    next(error);
  }
});

/**
 * Update a user profile
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    
    // Check if userId is a valid number
    const isNumericId = /^\d+$/.test(userId);
    
    if (!isNumericId) {
      return res.status(400).json({ 
        error: 'Invalid user ID format. Profile updates require a numeric user ID.' 
      });
    }
    
    const updateSchema = z.object({
      username: z.string().optional(),
      bio: z.string().optional(),
      profileColor: z.string().optional(),
    });
    
    const updateData = updateSchema.parse(req.body);
    const numericId = parseInt(userId);
    
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, numericId))
      .returning();
      
    if (!result.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * Batch fetch multiple user profiles
 */
router.get('/batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idsString = req.query.ids as string;
    if (!idsString) {
      return res.status(400).json({ error: 'No user IDs provided' });
    }
    const ids = idsString.split(',');
    const numericIds = ids
      .filter(id => /^\d+$/.test(id))
      .map(id => parseInt(id));
    const goatedIds = ids.filter(id => !/^\d+$/.test(id));
    const numericResults = numericIds.length ? 
      await db.query.users.findMany({
        where: (users, { inArray }) => inArray(users.id, numericIds)
      }) : [];
    const goatedResults = goatedIds.length ? 
      await db.query.users.findMany({
        where: (users, { inArray }) => inArray(users.goatedId, goatedIds)
      }) : [];
    const results = [...numericResults, ...goatedResults];
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Apply error handler
router.use(errorHandler);

export default router;