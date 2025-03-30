import express, { Request, Response } from "express";
import { db } from "db";
import { users, wagerRaces, bonusCodes, supportTickets } from "@db/schema";
import { eq, sql, count, and, gte, desc } from "drizzle-orm";
import * as crypto from "crypto";
import session from "express-session";

const router = express.Router();

// Middleware to check admin credentials using environment variables
const requireGoombasAdmin = async (req: Request, res: Response, next: any) => {
  // Check if admin is already authenticated in session
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized access" });
};

// Admin login route
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password, adminKey } = req.body;

    // Verify against environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminSecretKey = process.env.ADMIN_SECRET_KEY;

    if (!adminUsername || !adminPassword || !adminSecretKey) {
      console.error("Admin credentials not properly configured in environment");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Verify all credentials match
    if (
      username === adminUsername &&
      password === adminPassword &&
      adminKey === adminSecretKey
    ) {
      // Set admin session
      req.session.isAdmin = true;
      return res.status(200).json({ success: true });
    }

    // Log failed attempt (security measure)
    console.warn(`Failed admin login attempt for username: ${username}`);
    return res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
});

// Admin logout route
router.post("/logout", (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      return res.status(200).json({ success: true });
    });
  } else {
    return res.status(200).json({ success: true });
  }
});

// Dashboard statistics route
router.get("/dashboard", requireGoombasAdmin, async (req: Request, res: Response) => {
  try {
    // Get current date for date filtering
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    
    // Query database for dashboard statistics
    const [
      userCount,
      activeRacesCount,
      pendingBonusesCount,
      openSupportTicketsCount
    ] = await Promise.all([
      // Total user count
      db.select({ count: count() }).from(users).then(result => result[0].count),
      
      // Active races count
      db.select({ count: count() }).from(wagerRaces)
        .where(and(
          gte(wagerRaces.endDate, new Date()),
          eq(wagerRaces.status, 'live')
        ))
        .then(result => result[0].count),
      
      // Pending bonuses count
      db.select({ count: count() }).from(bonusCodes)
        .where(eq(bonusCodes.isUsed, false))
        .then(result => result[0].count),
      
      // Open support tickets count
      db.select({ count: count() }).from(supportTickets)
        .where(eq(supportTickets.status, "open"))
        .then(result => result[0].count)
    ]);

    // Build and return dashboard stats
    const stats = {
      userCount,
      activeRaces: activeRacesCount,
      pendingBonuses: pendingBonusesCount,
      openSupportTickets: openSupportTicketsCount,
      lastUpdated: new Date().toISOString()
    };

    return res.status(200).json({ stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

// Recent activity for admin dashboard
router.get("/recent-activity", requireGoombasAdmin, async (req: Request, res: Response) => {
  try {
    // Get recent user registrations
    const recentUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      limit: 5,
    });

    // Get recent bonus code creations
    const recentBonusCodes = await db.query.bonusCodes.findMany({
      orderBy: [desc(sql`${bonusCodes.id}`)],
      limit: 5,
    });

    // Get recent support tickets
    const recentTickets = await db.query.supportTickets.findMany({
      orderBy: [desc(supportTickets.createdAt)],
      limit: 5,
    });

    return res.status(200).json({
      recentUsers: recentUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      })),
      recentBonusCodes: recentBonusCodes.map(code => ({
        id: code.id,
        code: code.code,
        isUsed: code.isUsed,
      })),
      recentTickets: recentTickets.map(ticket => ({
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

export default router;