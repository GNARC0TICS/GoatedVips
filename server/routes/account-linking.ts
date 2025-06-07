import { Router, Request, Response, NextFunction } from 'express';
import profileService from '../services/profileService';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const router = Router();

// Rate limiter: 30 requests/minute per IP for POST endpoints
const postLimiter = new RateLimiterMemory({ points: 30, duration: 60 });

const withPostRateLimit = (handler: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await postLimiter.consume(req.ip || 'unknown');
      return handler(req, res, next);
    } catch (err) {
      return res.status(429).json({ error: 'Too many requests' });
    }
  };

/**
 * Route to request account linking (user initiated)
 * POST /api/account/request-link
 */
router.post("/request-link", requireAuth, withPostRateLimit(async (req, res, next) => {
  try {
    const { goatedUsername, privacySettings } = req.body; // Extract privacySettings
    const userId = String(req.user!.id);
    // Pass privacySettings to the service method
    const result = await profileService.requestGoatedAccountLink(userId, goatedUsername, privacySettings); 
    return res.json(result);
  } catch (err) {
    next(err);
  }
}));

/**
 * Route to unlink an account
 * POST /api/account/unlink-account
 */
router.post("/unlink-account", requireAuth, withPostRateLimit(async (req, res, next) => {
  try {
    const userId = String(req.user!.id);
    const result = await profileService.unlinkGoatedAccount(userId);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}));

/**
 * Route to check if a Goated username exists
 * GET /api/account/check-goated-username/:username
 */
router.get("/check-goated-username/:username", requireAuth, async (req, res, next) => {
  try {
    const { username } = req.params;
    // TODO: Move checkGoatedUsername to profileService if not already there
    const result = await profileService.checkGoatedUsername(username);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * Route for admin to approve account linking
 * POST /api/account/admin-approve-link
 */
router.post("/admin-approve-link", requireAuth, requireAdmin, withPostRateLimit(async (req, res, next) => {
  try {
    const { userId, goatedId } = req.body;
    const adminUsername = req.user!.username;
    const updatedUser = await profileService.approveGoatedAccountLink(userId, goatedId, adminUsername);
    return res.json({ success: true, message: `Account link approved for ${updatedUser.username}`, user: updatedUser });
  } catch (err) {
    next(err);
  }
}));

/**
 * Route for admin to reject account linking
 * POST /api/account/admin-reject-link
 */
router.post("/admin-reject-link", requireAuth, requireAdmin, withPostRateLimit(async (req, res, next) => {
  try {
    const { userId, reason } = req.body;
    const adminUsername = req.user!.username;
    const result = await profileService.rejectGoatedAccountLink(userId, reason || 'Rejected by admin', adminUsername);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}));

export default router;
