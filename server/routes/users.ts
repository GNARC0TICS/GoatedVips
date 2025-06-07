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
 * Get user by ID, applying privacy rules based on user's clarification.
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profileId = req.params.id;
    const requester = req.user as Express.User | undefined; // Authenticated user, if any

    const userProfile = await profileService.ensureUserProfile(profileId);

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isOwner = requester && String(requester.id) === String(userProfile.id);

    // Owner sees everything
    if (isOwner) {
      return res.json(userProfile);
    }

    // Not the owner, apply privacy rules
    // A user can only make a profile private if they link their created account to one of the goated accounts.
    // If private: name censored, stats hidden. Otherwise, public.

    if (userProfile.goatedAccountLinked && userProfile.profilePublic === false) {
      // Profile is linked AND explicitly set to private by the user
      return res.json({
        id: userProfile.id,
        username: `User ${String(userProfile.id).slice(-4)}`, // Censored username
        profileColor: userProfile.profileColor,
        profilePublic: false,
        goatedAccountLinked: userProfile.goatedAccountLinked,
        // No bio, no stats, other sensitive info hidden
      });
    } else {
      // Profile is public by default, or linked and explicitly public
      const publicProfileData: any = {
        id: userProfile.id,
        username: userProfile.username,
        bio: userProfile.bio,
        profileColor: userProfile.profileColor,
        createdAt: userProfile.createdAt, // Assuming createdAt is fine to show
        goatedId: userProfile.goatedId,
        goatedUsername: userProfile.goatedUsername,
        goatedAccountLinked: userProfile.goatedAccountLinked,
        profilePublic: true, // Explicitly state it's being treated as public in this branch
        // other generally public fields can be added here
      };

      // Stats visibility:
      // If profile is effectively public (this branch), show stats if user has showStats: true OR if it's a Goated profile not yet linked by a site user (where showStats might be default true or not applicable)
      // The user plan states: "a user can only make a profile private if they link... then they can turn on privacy so they are not shown on leaderboards but instead have their name censored (hidden) as well as their profile stats"
      // This implies if it's private, stats are hidden. If public, stats are shown based on showStats.
      // Since this 'else' branch means the profile is effectively public:
      if (userProfile.showStats) {
        publicProfileData.totalWager = userProfile.totalWager;
        // Add other stats like tier, rank if available and showStats is true
        // publicProfileData.tier = userProfile.tier;
        // publicProfileData.rank = userProfile.rank; // Example
      }
      return res.json(publicProfileData);
    }

  } catch (err) {
    next(err);
  }
});

/*
DEPRECATED: This route is now replaced by the GET /api/leaderboard endpoint in apiRoutes.ts.
Please migrate to the new /api/leaderboard?timeframe=<period> endpoint which 
provides a unified data structure and more robust implementation.

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
*/

/**
 * Get user stats
 */
router.get('/:id/stats', async (req, res, next) => {
  try {
    const userId = req.params.id;
    // Corrected to use statSyncService for rankings
    const stats = await statSyncService.getUserRankings(userId);
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
