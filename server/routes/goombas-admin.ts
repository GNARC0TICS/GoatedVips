import { Router, Request, Response } from 'express';
import { db } from '@db/index';
import { users, wheelSpins, bonusCodes, wagerRaces, wagerRaceParticipants, supportTickets } from '@db/schema';
import { count } from 'drizzle-orm';
import { requireAdmin } from '../middleware/admin';

const router = Router();

// Simplified validation for Goombas Admin (credentials from env)
const validateGoombasAdminCredentials = (username?: string, password?: string, secretKey?: string): boolean => {
  // In a real scenario, ensure these env vars are set and handled securely
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY; // Assuming this was also used

  return !!ADMIN_USERNAME && !!ADMIN_PASSWORD && !!ADMIN_SECRET_KEY &&
         username === ADMIN_USERNAME && 
         password === ADMIN_PASSWORD && 
         secretKey === ADMIN_SECRET_KEY;
};

// Goombas Admin login endpoint (Session-based)
router.post('/login', async (req: Request, res: Response) => {
  const { username, password, secretKey } = req.body;

  if (!username || !password || !secretKey) {
    return res.status(400).json({ 
      message: 'Missing credentials',
      status: 'error'
    });
  }

  const isValid = validateGoombasAdminCredentials(username, password, secretKey);
  
  if (isValid) {
    if (req.session) {
      req.session.isAdmin = true;
      return res.status(200).json({
        message: 'Goombas Admin authentication successful',
        status: 'success'
      });
    } else {
      // Should not happen if session middleware is correctly applied to this router
      return res.status(500).json({ message: 'Session not available', status: 'error' });
    }
  } else {
    return res.status(401).json({ 
      message: 'Invalid Goombas Admin credentials',
      status: 'error'
    });
  }
});

// Goombas Admin logout endpoint (Session-based)
router.post('/logout', requireAdmin, (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error during Goombas Admin logout',
          status: 'error'
        });
      }
      return res.status(200).json({ 
        message: 'Goombas Admin logout successful',
        status: 'success'
      });
    });
  } else {
    return res.status(200).json({ 
      message: 'No active session to logout from',
      status: 'success' // Or an error, depending on desired behavior
    });
  }
});

// Goombas Admin auth status check (Session-based)
router.get('/auth-status', (req: Request, res: Response) => {
  if (req.session && req.session.isAdmin) {
    return res.status(200).json({ 
      isAdmin: true,
      status: 'success'
    });
  }
  return res.status(401).json({ 
    isAdmin: false,
    status: 'error',
    message: 'Not authenticated as Goombas Admin'
  });
});

// Basic analytics endpoint
router.get('/analytics', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Count total users
    const userCount = await db.select({ count: count() }).from(users);
    
    // Get recent users (last 10 registered)
    const recentUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      createdAt: users.createdAt,
      isAdmin: users.isAdmin
    })
    .from(users)
    .orderBy(users.createdAt)
    .limit(10);

    // Count wheel spins
    const wheelSpinCount = await db.select({ count: count() }).from(wheelSpins);
    
    // Count bonus codes
    const bonusCodeCount = await db.select({ count: count() }).from(bonusCodes);
    
    // Count wager races
    const wagerRaceCount = await db.select({ count: count() }).from(wagerRaces);
    
    // Count wager race participants
    const wagerRaceParticipantCount = await db.select({ count: count() }).from(wagerRaceParticipants);

    // Count support tickets
    const supportTicketCount = await db.select({ count: count() }).from(supportTickets);
    
    // Send aggregated analytics data
    res.status(200).json({
      totalUsers: userCount[0]?.count || 0,
      recentUsers,
      stats: {
        wheelSpins: wheelSpinCount[0]?.count || 0,
        bonusCodes: bonusCodeCount[0]?.count || 0,
        wagerRaces: wagerRaceCount[0]?.count || 0,
        wagerRaceParticipants: wagerRaceParticipantCount[0]?.count || 0,
        supportTickets: supportTicketCount[0]?.count || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      message: 'Error fetching analytics',
      status: 'error'
    });
  }
});

// User management endpoints
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    res.status(200).json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      status: 'error'
    });
  }
});

// Get a specific user
router.get('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  
  if (isNaN(userId)) {
    return res.status(400).json({ 
      message: 'Invalid user ID',
      status: 'error'
    });
  }
  
  try {
    const user = await db.select().from(users).where(users.id === userId);
    
    if (!user || user.length === 0) {
      return res.status(404).json({ 
        message: 'User not found',
        status: 'error'
      });
    }
    
    res.status(200).json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      message: 'Error fetching user',
      status: 'error'
    });
  }
});

export default router;