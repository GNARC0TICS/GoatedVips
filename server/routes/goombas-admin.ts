import { Router, Request, Response, NextFunction } from 'express';
import { db } from '@db';
import { users, wagerRaces, bonusCodes } from '@db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_KEY } from '../middleware/admin';

const router = Router();

// Admin login validation schema
const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  adminKey: z.string().min(1, "Admin key is required")
});

// Middleware to check if admin is logged in via session
const requireAdminSession = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: "Admin authentication required" });
  }
};

// Admin login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validationResult = adminLoginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: validationResult.error.issues 
      });
    }
    
    const { username, password, adminKey } = validationResult.data;
    
    // Verify credentials against environment variables
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD || adminKey !== ADMIN_KEY) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }
    
    // Set admin session
    if (req.session) {
      req.session.isAdmin = true;
    }
    
    res.json({ success: true, message: "Admin authenticated successfully" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  if (req.session) {
    req.session.isAdmin = false;
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying admin session:", err);
      }
    });
  }
  res.json({ success: true, message: "Admin logged out successfully" });
});

// Get admin dashboard stats
router.get('/dashboard', requireAdminSession, async (_req: Request, res: Response) => {
  try {
    const [userCount, activeRaceCount, pendingBonusCount] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(users),
      db.select({ count: sql`count(*)` }).from(wagerRaces).where(eq(wagerRaces.status, 'live')),
      db.select({ count: sql`count(*)` }).from(bonusCodes).where(sql`claimed_at IS NULL`)
    ]);
    
    res.json({
      stats: {
        userCount: userCount[0].count,
        activeRaces: activeRaceCount[0].count,
        pendingBonuses: pendingBonusCount[0].count
      }
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch admin dashboard stats" });
  }
});

// Get all users for admin
router.get('/users', requireAdminSession, async (_req: Request, res: Response) => {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      limit: 100
    });
    
    res.json({ users: allUsers });
  } catch (error) {
    console.error("Error fetching users for admin:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get all races for admin
router.get('/races', requireAdminSession, async (_req: Request, res: Response) => {
  try {
    const allRaces = await db.query.wagerRaces.findMany({
      orderBy: [desc(wagerRaces.updatedAt)],
      limit: 100
    });
    
    res.json({ races: allRaces });
  } catch (error) {
    console.error("Error fetching races for admin:", error);
    res.status(500).json({ error: "Failed to fetch races" });
  }
});

// Get all bonus codes for admin
router.get('/bonus-codes', requireAdminSession, async (_req: Request, res: Response) => {
  try {
    const allBonusCodes = await db.query.bonusCodes.findMany({
      orderBy: [desc(bonusCodes.createdAt)],
      limit: 100
    });
    
    res.json({ bonusCodes: allBonusCodes });
  } catch (error) {
    console.error("Error fetching bonus codes for admin:", error);
    res.status(500).json({ error: "Failed to fetch bonus codes" });
  }
});

// Update user (admin only)
router.put('/users/:userId', requireAdminSession, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const updateData = req.body;
    
    // Prevent updating critical admin fields from this endpoint
    delete updateData.isAdmin;
    delete updateData.password;
    
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));
    
    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;