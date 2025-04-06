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
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { ensureUserProfile } from '../index';

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
 * Get a user profile by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`API user profile request for ID: ${req.params.id}`);
    const userId = req.params.id;
    
    // Use the central ensureUserProfile function to get or create the user
    const user = await ensureUserProfile(userId);
    
    if (!user) {
      return res.status(404).json({ 
        status: "error", 
        message: "User not found and could not be created" 
      });
    }
    
    // Try to get total wager from API for accurate tier calculation
    let totalWager = 0; 
    
    if (user.goatedId) {
      try {
        // Fetch the latest stats for this user
        const token = process.env.API_TOKEN || require('../config/api').API_CONFIG.token;
        const leaderboardUrl = `https://api.goated.com/user2/affiliate/referral-leaderboard/2RW440E`;
        
        console.log(`Fetching wager data for user ${user.goatedId} from API`);
        
        const response = await fetch(leaderboardUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000),
        });
        
        if (response.ok) {
          const leaderboardData = await response.json();
          console.log(`Raw API response for ${user.goatedId}:`, JSON.stringify({
            hasData: !!leaderboardData?.data,
            timeframes: leaderboardData?.data ? Object.keys(leaderboardData.data) : [],
            userFound: false // Will be updated below if found
          }));
          
          const timeframes = ['all_time', 'monthly', 'weekly', 'today'];
          
          // Search all timeframes to find this user
          for (const timeframe of timeframes) {
            const users = leaderboardData?.data?.[timeframe]?.data || [];
            const foundUser = users.find((u: any) => u.uid === user.goatedId);
            
            if (foundUser) {
              console.log(`Found user in ${timeframe} data:`, JSON.stringify({
                name: foundUser.name,
                uid: foundUser.uid,
                hasWagered: !!foundUser.wagered,
                wageredKeys: foundUser.wagered ? Object.keys(foundUser.wagered) : []
              }));
              
              if (foundUser.wagered && typeof foundUser.wagered.all_time === 'number') {
                totalWager = foundUser.wagered.all_time;
                console.log(`Found all_time wager for user ${user.goatedId}: ${totalWager}`);
                break;
              }
            }
          }
        } else {
          console.error(`Failed to fetch leaderboard data: ${response.status} ${response.statusText}`);
        }
      } catch (statsError) {
        console.error(`Error fetching wager stats for user ${userId}:`, statsError);
      }
    }
    
    // Return enhanced user profile data with totalWager for tier calculation
    const responseData = {
      id: user.id,
      username: user.username,
      password: user.password || "",
      email: user.email || "",
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified || false,
      bio: user.bio || "",
      profileColor: user.profileColor || "#D7FF00",
      goatedId: user.goatedId,
      goatedUsername: user.goatedUsername,
      goatedAccountLinked: user.goatedAccountLinked || false,
      lastActive: user.lastActive,
      totalWager: totalWager // Add the totalWager for tier calculations
    };
    
    console.log(`Returning profile data with totalWager: ${totalWager}`);
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    next(error);
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
    
    // Normally we would fetch actual stats from database
    // For now, return placeholder data that will be replaced with real data
    // Typically this would come from the leaderboard data
    
    // Return empty stats by default
    const stats = {
      currentWager: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      allTime: 0,
      tier: 'BRONZE'
    };
    
    // TODO: Connect to actual stats from leaderboard or other data source
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * Update a user profile
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    
    // TODO: Add authentication check to ensure the current user owns this profile
    
    const updateSchema = z.object({
      username: z.string().optional(),
      bio: z.string().optional(),
      profileColor: z.string().optional(),
      // Add other updateable fields as needed
    });
    
    const updateData = updateSchema.parse(req.body);
    
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
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
    
    // Handle both numeric and Goated IDs
    const numericIds = ids
      .filter(id => /^\d+$/.test(id))
      .map(id => parseInt(id));
    
    const goatedIds = ids.filter(id => !/^\d+$/.test(id));
    
    // Fetch users by numeric IDs
    const numericResults = numericIds.length ? 
      await db.query.users.findMany({
        where: (users, { inArray }) => inArray(users.id, numericIds)
      }) : [];
    
    // Fetch users by Goated IDs
    const goatedResults = goatedIds.length ? 
      await db.query.users.findMany({
        where: (users, { inArray }) => inArray(users.goatedId, goatedIds)
      }) : [];
    
    // Combine results
    const results = [...numericResults, ...goatedResults];
    
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Apply error handler
router.use(errorHandler);

export default router;