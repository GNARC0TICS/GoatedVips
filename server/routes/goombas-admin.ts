import { Router, Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
// TODO: Create adminService for analytics if not present
import { requireAdmin } from '../middleware/admin';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import {
  validateAdminCredentials,
  setAdminSession,
  clearAdminSession,
  AUTH_ERROR_MESSAGES
} from '../utils/auth-utils';

const router = Router();

// Rate limiter: 10 login attempts per minute per IP
const loginLimiter = new RateLimiterMemory({ points: 10, duration: 60 });

const withLoginRateLimit = (handler: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await loginLimiter.consume(req.ip || 'unknown');
      return handler(req, res, next);
    } catch (err) {
      return res.status(429).json({ error: 'Too many login attempts' });
    }
  };

// POST /admin — secure admin login endpoint
router.post('/admin', withLoginRateLimit(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, secretKey } = req.body;
    if (!username || !password || !secretKey) {
      return res.status(400).json({ message: 'Missing credentials', status: 'error' });
    }
    const isValid = validateAdminCredentials(username, password, secretKey);
    if (isValid) {
      setAdminSession(req);
      return res.status(200).json({ message: 'Authentication successful', status: 'success' });
    } else {
      return res.status(401).json({ message: 'Invalid credentials', status: 'error' });
    }
  } catch (err) {
    next(err);
  }
}));

// POST /admin/logout — admin logout
router.post('/admin/logout', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    clearAdminSession(req);
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error during logout', status: 'error' });
      }
      res.status(200).json({ message: 'Logout successful', status: 'success' });
    });
  } catch (err) {
    next(err);
  }
});

// GET /admin/analytics — admin analytics (TODO: move logic to adminService)
router.get('/admin/analytics', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Move analytics logic to adminService
    // Example: const stats = await adminService.getAnalyticsStats();
    return res.status(501).json({ message: 'Not implemented. Move logic to adminService.' });
  } catch (err) {
    next(err);
  }
});

// GET /admin/users — admin: get all users
router.get('/admin/users', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Add pagination support to userService.getAllUsers
    const users = await userService.getAllUsers();
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

// GET /admin/users/:id — admin: get specific user
router.get('/admin/users/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    const user = await userService.findUserById(userId);
    if (!user) return res.status(404).json({ message: 'User not found', status: 'error' });
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// GET /admin/auth-status — check admin auth status
router.get('/admin/auth-status', (req: Request, res: Response) => {
  if (req.session.isAdmin) {
    res.status(200).json({ isAdmin: true, status: 'success' });
  } else {
    res.status(401).json({ isAdmin: false, status: 'error' });
  }
});

export default router;
