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
import userService from '../services/userService';
import profileService from '../services/profileService';
import statSyncService from '../services/statSyncService';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const router = Router();

// Rate limiter: 60 requests/minute per IP for public endpoints
const publicLimiter = new RateLimiterMemory({ points: 60, duration: 60 });

// Helper for rate-limited routes
const withRateLimit = (handler: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await publicLimiter.consume(req.ip || 'unknown');
      return handler(req, res, next);
    } catch (err) {
      return res.status(429).json({ error: 'Too many requests' });
    }
  };

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
router.get('/search', withRateLimit(async (req, res, next) => {
  try {
    const query = req.query.username as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    // TODO: Add pagination support to userService.searchUsers
    const results = await userService.searchUsers(query, limit);
    return res.json({ results, pagination: { page, limit } });
  } catch (err) {
    next(err);
  }
}));

/**
 * Get user by ID (from our database)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    // TODO: Support lookup by goatedId if needed in userService
    const user = await userService.findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * Get leaderboard data from our database
 */
router.get('/leaderboard/:timeframe', async (req, res, next) => {
  try {
    const { timeframe } = req.params;
    // TODO: statSyncService.getTopPerformers should accept timeframe param
    const topPerformers = await statSyncService.getTopPerformers(100); // limit 100
    let data;
    switch (timeframe) {
      case 'daily': data = topPerformers.daily; break;
      case 'weekly': data = topPerformers.weekly; break;
      case 'monthly': data = topPerformers.monthly; break;
      case 'all_time':
      default: data = topPerformers.allTime; break;
    }
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * Get user stats
 */
router.get('/:id/stats', async (req, res, next) => {
  try {
    const userId = req.params.id;
    // TODO: profileService.getUserRankings should accept userId
    const stats = await profileService.getUserRankings(userId);
    return res.json(stats);
  } catch (err) {
    next(err);
  }
});

/**
 * Update a user profile
 */
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = req.params.id;
    // Only allow users to update their own profile unless admin (optional: add admin check)
    if (String(req.user?.id) !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // TODO: Validate allowed fields for update
    const updateData = req.body;
    // Prefer profileService.updateUser if profile fields, else userService.updateUser
    const updated = await profileService.updateUser(userId, updateData);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * Batch fetch multiple user profiles
 */
router.get('/batch', withRateLimit(async (req, res, next) => {
  try {
    const idsString = req.query.ids as string;
    if (!idsString) return res.status(400).json({ error: 'No user IDs provided' });
    const ids = idsString.split(',');
    // TODO: userService.findUsersByIds should support both numeric and goated IDs
    const results = await userService.findUsersByIds(ids);
    return res.json(results);
  } catch (err) {
    next(err);
  }
}));

/**
 * Administrative endpoints (require admin access)
 */

// Get all users (admin only)
router.get('/admin/all', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // TODO: Add pagination support to userService.getAllUsers
    const users = await userService.getAllUsers();
    return res.json(users);
  } catch (err) {
    next(err);
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

// Apply error handler
router.use(errorHandler);

export default router;