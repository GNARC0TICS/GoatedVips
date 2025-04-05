import { Router, Request, Response } from 'express';
import { db } from '@db/index';
import { users, wheelSpins, bonusCodes, wagerRaces, wagerRaceParticipants, supportTickets } from '@db/schema';
import { count, eq } from 'drizzle-orm';
import { validateAdminCredentials, requireAdmin } from '../middleware/admin';

const router = Router();

// Secure admin login endpoint
router.post('/login', async (req: Request, res: Response) => {
  const { username, password, secretKey } = req.body;

  if (!username || !password || !secretKey) {
    return res.status(400).json({ 
      message: 'Missing credentials',
      status: 'error'
    });
  }

  // Validate admin credentials against environment variables
  const isValid = validateAdminCredentials(username, password, secretKey);
  
  if (isValid) {
    // Set session flag to indicate admin authentication
    if (req.session) {
      req.session.isAdmin = true;
    }
    
    return res.status(200).json({
      message: 'Authentication successful',
      status: 'success'
    });
  } else {
    return res.status(401).json({ 
      message: 'Invalid credentials',
      status: 'error'
    });
  }
});

// Admin logout endpoint
router.post('/logout', requireAdmin, (req: Request, res: Response) => {
  // Clear admin session
  if (req.session) {
    req.session.isAdmin = false;
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error during logout',
          status: 'error'
        });
      }
      res.status(200).json({ 
        message: 'Logout successful',
        status: 'success'
      });
    });
  } else {
    res.status(200).json({ 
      message: 'Logout successful',
      status: 'success'
    });
  }
});

// Basic analytics endpoint - now restricted by requireAdmin only
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
    // Fixed query with proper type safety
    const user = await db.select().from(users).where(eq(users.id, userId));
    
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

// Check admin auth status
router.get('/auth-status', (req: Request, res: Response) => {
  if (req.session && req.session.isAdmin) {
    res.status(200).json({ 
      isAdmin: true,
      status: 'success'
    });
  } else {
    res.status(401).json({ 
      isAdmin: false,
      status: 'error'
    });
  }
});

export default router;