import { Router } from "express";
import { db } from "@db";
import { users } from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { ensureUserProfile } from "../index";

const router = Router();

/**
 * User profile API endpoints
 * 
 * This file contains endpoints for:
 * 1. Fetching detailed user statistics by ID
 * 2. Ensuring user profiles exist (creating them if needed)
 * 3. Fetching quick profile previews
 */

/**
 * Ensure a user profile exists in the database
 * If the profile doesn't exist, attempt to create it from Goated API data
 */
router.post("/ensure-profile-from-id", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    // Try to ensure the profile exists
    const userProfile = await ensureUserProfile(userId);
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found and could not be created"
      });
    }
    
    // Return the user ID for navigation
    return res.json({
      success: true,
      id: userProfile.id,
      message: "User profile verified"
    });
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify user profile"
    });
  }
});

/**
 * Get user stats for a specific user ID
 * 
 * This endpoint provides detailed statistics for a user profile including:
 * - Basic profile information
 * - Wager statistics (total, weekly, monthly)
 * - Account status (verification, etc.)
 * 
 * It supports fetching by either internal DB ID or Goated ID
 */
router.get("/stats/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`User stats requested for ID: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required"
      });
    }

    // Try to ensure the user profile exists (works with both numeric and Goated IDs)
    const userProfile = await ensureUserProfile(userId);
    
    if (!userProfile) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }

    // Now that we have the user, fetch their detailed stats
    // This query combines user profile data with wager stats in a single result
    let query;
    const isNumericId = !isNaN(Number(userId));
    
    if (isNumericId) {
      console.log(`Executing SQL query for ID ${userId}`);
      query = sql`
        SELECT 
          u.id,
          u.username,
          u.email,
          u.goated_id AS "goatedId",
          u.bio,
          u.profile_color AS "profileColor",
          u.created_at AS "createdAt",
          u.total_wagered AS "totalWagered",
          u.weekly_wagered AS "weeklyWagered",
          u.monthly_wagered AS "monthlyWagered",
          u.goated_account_linked AS "goatedAccountLinked",
          u.telegram_username AS "telegramUsername"
        FROM users u
        WHERE u.id = ${parseInt(userId)}
        LIMIT 1
      `;
    } else {
      console.log(`Executing SQL query for Goated ID ${userId}`);
      query = sql`
        SELECT 
          u.id,
          u.username,
          u.email,
          u.goated_id AS "goatedId",
          u.bio,
          u.profile_color AS "profileColor",
          u.created_at AS "createdAt",
          u.total_wagered AS "totalWagered",
          u.weekly_wagered AS "weeklyWagered",
          u.monthly_wagered AS "monthlyWagered",
          u.goated_account_linked AS "goatedAccountLinked",
          u.telegram_username AS "telegramUsername"
        FROM users u
        WHERE u.goated_id = ${userId}
        LIMIT 1
      `;
    }

    const result = await db.execute(query);
    console.log("Query results:", JSON.stringify(result, null, 2));
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found after query"
      });
    }

    // Extract user data
    const userData = result.rows[0];
    console.log("Extracted user data:", userData);
    
    // Calculate tier based on total wagered
    // This calculation can be expanded or moved to a utility function
    let tier = 'bronze';
    const totalWagered = parseFloat(userData.totalWagered || '0');
    
    if (totalWagered >= 250000) {
      tier = 'diamond';
    } else if (totalWagered >= 50000) {
      tier = 'platinum';
    } else if (totalWagered >= 10000) {
      tier = 'gold';
    } else if (totalWagered >= 1000) {
      tier = 'silver';
    }
    
    // Return the combined user stats
    res.json({
      ...userData,
      tier
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user statistics"
    });
  }
});

export default router;