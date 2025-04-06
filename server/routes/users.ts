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
    const userId = req.params.id;
    
    // Check if the ID is numeric
    const isNumericId = /^\d+$/.test(userId);
    
    let user;
    if (isNumericId) {
      // Fetch by internal ID
      user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(userId))
      });
    } else {
      // Fetch by Goated ID
      user = await db.query.users.findFirst({
        where: eq(users.goatedId, userId)
      });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
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