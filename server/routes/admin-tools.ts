
import { Router } from "express";
import { db } from "@db";
import { mockWagerData } from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { ensureAdmin } from "../middleware/admin";
import { createRateLimiter } from "../middleware/rate-limit";

const router = Router();

// Apply admin middleware to all routes
router.use(ensureAdmin);
router.use(createRateLimiter('medium'));

/**
 * Route to modify a user's wager amount in the mockWagerData table
 * This allows admins to adjust wager amounts for specific users
 */
router.post("/modify-wager", async (req, res) => {
  try {
    const { username, wageredToday, wageredThisWeek, wageredThisMonth, wageredAllTime } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    
    // Check if this user already has mock data
    const existingData = await db.select()
      .from(mockWagerData)
      .where(eq(mockWagerData.username, username))
      .limit(1);
    
    if (existingData.length > 0) {
      // Update existing record
      await db.update(mockWagerData)
        .set({
          wageredToday: wageredToday !== undefined ? wageredToday : existingData[0].wageredToday,
          wageredThisWeek: wageredThisWeek !== undefined ? wageredThisWeek : existingData[0].wageredThisWeek,
          wageredThisMonth: wageredThisMonth !== undefined ? wageredThisMonth : existingData[0].wageredThisMonth,
          wageredAllTime: wageredAllTime !== undefined ? wageredAllTime : existingData[0].wageredAllTime,
          updatedAt: new Date()
        })
        .where(eq(mockWagerData.username, username));
      
      return res.json({ 
        success: true, 
        message: `Successfully updated wager data for ${username}`,
        data: {
          wageredToday: wageredToday !== undefined ? wageredToday : existingData[0].wageredToday,
          wageredThisWeek: wageredThisWeek !== undefined ? wageredThisWeek : existingData[0].wageredThisWeek,
          wageredThisMonth: wageredThisMonth !== undefined ? wageredThisMonth : existingData[0].wageredThisMonth,
          wageredAllTime: wageredAllTime !== undefined ? wageredAllTime : existingData[0].wageredAllTime
        }
      });
    } else {
      // Create new mock data record
      await db.insert(mockWagerData).values({
        username,
        wageredToday: wageredToday || 0,
        wageredThisWeek: wageredThisWeek || 0,
        wageredThisMonth: wageredThisMonth || 0,
        wageredAllTime: wageredAllTime || 0,
        isMocked: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Use the admin user's ID as the creator if available
        createdBy: req.user?.id || null
      });
      
      return res.json({
        success: true,
        message: `Successfully created mock wager data for ${username}`,
        data: {
          wageredToday: wageredToday || 0,
          wageredThisWeek: wageredThisWeek || 0,
          wageredThisMonth: wageredThisMonth || 0,
          wageredAllTime: wageredAllTime || 0
        }
      });
    }
  } catch (error) {
    console.error("Error modifying wager data:", error);
    res.status(500).json({ error: "Failed to modify wager data" });
  }
});

export default router;
