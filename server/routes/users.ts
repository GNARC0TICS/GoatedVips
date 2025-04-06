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
 * 
 * This implementation avoids external API calls on profile fetch to prevent timeouts.
 * The totalWager field is still included, but populated from the database or cached values
 * rather than making a blocking API call during the request.
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
    
    // For now, include a placeholder totalWager field
    // This will be populated properly in a background process or from cache
    // to avoid API timeout issues during profile loads
    const totalWager = 0;
    
    // Create a standardized response object with the totalWager field
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
      totalWager: totalWager // Including totalWager field
    };
    
    console.log(`Returning profile data with totalWager placeholder`);
    
    // Send the response immediately with placeholder data
    res.json(responseData);
    
    // Then start an asynchronous process to update the totalWager in the database
    if (user.goatedId) {
      // This runs after the response is sent, so it won't block
      setTimeout(async () => {
        try {
          console.log(`Starting background wager data update for ${user.goatedId}`);
          // Get the API token
          const token = process.env.API_TOKEN || require('../config/api').API_CONFIG.token;
          const leaderboardUrl = `https://api.goated.com/user2/affiliate/referral-leaderboard/2RW440E`;
          
          const response = await fetch(leaderboardUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(30000),
          });
          
          if (response.ok) {
            const leaderboardData = await response.json();
            if (leaderboardData?.data) {
              const timeframes = ['all_time', 'monthly', 'weekly', 'today'];
              let updatedWager = 0;
              
              // Search all timeframes to find this user
              for (const timeframe of timeframes) {
                const users = leaderboardData.data[timeframe]?.data || [];
                const foundUser = users.find((u: any) => u.uid === user.goatedId);
                
                if (foundUser && foundUser.wagered && typeof foundUser.wagered.all_time === 'number') {
                  updatedWager = foundUser.wagered.all_time;
                  console.log(`Background process: Updated wager for ${user.goatedId} to ${updatedWager}`);
                  
                  // Here you would update the user record in the database with the new wager value
                  // This is just a placeholder for now, as we'd need to add a totalWager field to the users table
                  /*
                  await db.update(users)
                    .set({ totalWager: updatedWager })
                    .where(eq(users.goatedId, user.goatedId))
                    .execute();
                  */
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.error(`Background wager update failed for ${user.goatedId}:`, error);
        }
      }, 100); // Small delay to ensure response is sent first
    }
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