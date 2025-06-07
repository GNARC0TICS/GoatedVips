/**
 * API Routes
 * This file defines all the API routes for the platform, using the focused services
 * for data processing, race management, and user profile operations.
 * 
 * Updated to use modular services instead of monolithic platformApiService
 */

import { Router } from "express";
import goatedApiService from "../services/goatedApiService";
import { cacheService } from "../services/cacheService";
import statSyncService from "../services/statSyncService";
import raceService from "../services/raceService";
import profileService from "../services/profileService";
import { syncLeaderboardUsers } from "../services/leaderboardSyncService";
import { db } from "../../db";
import { leaderboardUsers, users as mainUsersTable } from "../../db/schema";
import { desc, asc, sql, eq } from "drizzle-orm";
import { withCache } from "../services/cacheService";
import { z } from "zod";

const router = Router();

/**
 * Get affiliate leaderboard stats
 * Used by the leaderboard page to display user rankings
 */
router.get("/affiliate/stats", async (req, res) => {
  try {
    console.log("DEBUG: Serving leaderboard data with database query");
    
    // Get all users from database, sorted by monthly wager (primary sort)
    const allUsers = await db.select()
      .from(leaderboardUsers)
      .orderBy(desc(leaderboardUsers.wager_month), desc(leaderboardUsers.wager_all_time))
      .limit(3000); // Get more than needed for safety

    console.log(`DEBUG: Retrieved ${allUsers.length} users from database`);
    
    // Transform to match frontend expectations
    const transformedUsers = allUsers.map((user, index) => ({
      uid: user.uid,
      name: user.name,
      wagered: {
        today: parseFloat(user.wager_today?.toString() || "0"),
        this_week: parseFloat(user.wager_week?.toString() || "0"),
        this_month: parseFloat(user.wager_month?.toString() || "0"),
        all_time: parseFloat(user.wager_all_time?.toString() || "0")
      },
      rank: index + 1
    }));

    // Create separate sorted arrays for each time period
    const todayData = [...transformedUsers].sort((a, b) => b.wagered.today - a.wagered.today).map((user, index) => ({ ...user, rank: index + 1 }));
    const weeklyData = [...transformedUsers].sort((a, b) => b.wagered.this_week - a.wagered.this_week).map((user, index) => ({ ...user, rank: index + 1 }));
    const monthlyData = [...transformedUsers].sort((a, b) => b.wagered.this_month - a.wagered.this_month).map((user, index) => ({ ...user, rank: index + 1 }));
    const allTimeData = [...transformedUsers].sort((a, b) => b.wagered.all_time - a.wagered.all_time).map((user, index) => ({ ...user, rank: index + 1 }));

    // Return in the exact format the frontend expects
    const response = {
      status: "success",
      metadata: {
        totalUsers: allUsers.length,
        lastUpdated: new Date().toISOString(),
        cached: false
      },
      data: {
        today: { data: todayData },
        weekly: { data: weeklyData },
        monthly: { data: monthlyData },
        allTime: { data: allTimeData }
      }
    };

    console.log(`DEBUG: Returning leaderboard data with ${allUsers.length} users in correct format`);
    res.json(response);
    
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({
      status: "error",
      error: "Failed to fetch leaderboard data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/*
DEPRECATED: This route is now replaced by the GET /leaderboard endpoint.
This /api/affiliate/stats endpoint was previously used by the leaderboard page 
and old components to display user rankings. Please migrate to the new 
/leaderboard?timeframe=<period> endpoint which provides a unified data structure.

router.get("/affiliate/stats", async (req, res) => {
  try {
    console.log("DEBUG: Serving leaderboard data with database query");
    
    // Get all users from database, sorted by monthly wager (primary sort)
    const allUsers = await db.select()
      .from(leaderboardUsers)
      .orderBy(desc(leaderboardUsers.wager_month), desc(leaderboardUsers.wager_all_time))
      .limit(3000); // Get more than needed for safety

    console.log(`DEBUG: Retrieved ${allUsers.length} users from database`);
    
    // Transform to match frontend expectations
    const transformedUsers = allUsers.map((user, index) => ({
      uid: user.uid,
      name: user.name,
      wagered: {
        today: parseFloat(user.wager_today?.toString() || "0"),
        this_week: parseFloat(user.wager_week?.toString() || "0"),
        this_month: parseFloat(user.wager_month?.toString() || "0"),
        all_time: parseFloat(user.wager_all_time?.toString() || "0")
      },
      rank: index + 1
    }));

    // Create separate sorted arrays for each time period
    const todayData = [...transformedUsers].sort((a, b) => b.wagered.today - a.wagered.today).map((user, index) => ({ ...user, rank: index + 1 }));
    const weeklyData = [...transformedUsers].sort((a, b) => b.wagered.this_week - a.wagered.this_week).map((user, index) => ({ ...user, rank: index + 1 }));
    const monthlyData = [...transformedUsers].sort((a, b) => b.wagered.this_month - a.wagered.this_month).map((user, index) => ({ ...user, rank: index + 1 }));
    const allTimeData = [...transformedUsers].sort((a, b) => b.wagered.all_time - a.wagered.all_time).map((user, index) => ({ ...user, rank: index + 1 }));

    // Return in the exact format the frontend expects
    const response = {
      status: "success",
      metadata: {
        totalUsers: allUsers.length,
        lastUpdated: new Date().toISOString(),
        cached: false
      },
      data: {
        today: { data: todayData },
        weekly: { data: weeklyData },
        monthly: { data: monthlyData },
        allTime: { data: allTimeData }
      }
    };

    console.log(`DEBUG: Returning leaderboard data with ${allUsers.length} users in correct format`);
    res.json(response);
    
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({
      status: "error",
      error: "Failed to fetch leaderboard data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
*/

/**
 * Manual sync endpoint to trigger leaderboard data sync
 */
router.post("/sync/leaderboard", async (req, res, next) => {
  try {
    console.log("Manual leaderboard sync triggered");
    const result = await syncLeaderboardUsers();
    res.json({ 
      message: "Leaderboard sync completed successfully",
      status: "success",
      result
    });
  } catch (err) {
    console.error("Manual leaderboard sync failed:", err);
    res.status(500).json({ 
      message: "Leaderboard sync failed",
      status: "error",
      error: err instanceof Error ? err.message : String(err)
    });
  }
});

/**
 * Get current wager race data
 * Used by the wager race page to display current competition
 */
router.get("/wager-races/current", async (req, res, next) => {
  try {
    const data = await withCache(
      "current-race", 
      async () => await raceService.getCurrentRace(),
      { ttl: 30000, namespace: "races" } // 30 seconds TTL
    );

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Race data fetch error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : "Failed to fetch race data"
      }
    });
  }
});

/**
 * Get previous wager race data
 * Used by the wager race page to display historical results
 */
router.get("/wager-races/previous", async (req, res, next) => {
  try {
    const data = await withCache(
      "previous-race",
      async () => await raceService.getPreviousRace(),
      { ttl: 30000, namespace: "races" } // 30 seconds TTL
    );

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Previous race data fetch error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : "Failed to fetch previous race data"
      }
    });
  }
});

/**
 * Get user's position in current race
 * Used by user dashboard to show their race standing
 */
router.get("/wager-race/position", async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid || typeof uid !== 'string') {
      return res.status(400).json({ error: "User ID (uid) is required" });
    }
    
    console.log(`Fetching race position for user ${uid}`);
    
    // Get user position using raceService (it now fetches its own leaderboard data)
    const positionData = await raceService.getUserRacePosition(uid);
    
    res.json(positionData);
  } catch (error) {
    console.error("Error fetching user race position:", error);
    res.status(500).json({ 
      error: "Failed to fetch user race position",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Trigger data synchronization
 * Used by admin tools to manually sync user profiles and wager data
 */
router.post("/sync/trigger", async (req, res) => {
  try {
    console.log("Manual sync triggered");
    
    // Start sync process using profileService
    const syncPromise = profileService.syncUserProfiles()
      .then(stats => {
        console.log("Manual sync completed:", stats);
        return stats;
      })
      .catch(error => {
        console.error("Manual sync failed:", error);
        throw error;
      });
    
    // Clear relevant caches to force fresh data
    cacheService.del("affiliate-stats");
    cacheService.del("current-wager-race");
    cacheService.del("previous-wager-race");
    
    res.json({ 
      message: "Sync started successfully",
      status: "running"
    });
    
    // Continue sync in background
    syncPromise.catch(console.error);
  } catch (error) {
    console.error("Error triggering sync:", error);
    res.status(500).json({ 
      error: "Failed to trigger sync",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Raw Goated API test endpoint
 * Used for debugging and testing external API connectivity
 */
router.get("/test/goated-raw", async (req, res) => {
  try {
    console.log("Fetching raw Goated API data for testing");
    
    const rawData = await goatedApiService.fetchReferralData();
    
    res.json({
      message: "Raw Goated API data",
      timestamp: new Date().toISOString(),
      data: rawData
    });
  } catch (error) {
    console.error("Error fetching raw Goated data:", error);
    res.status(500).json({ 
      error: "Failed to fetch raw Goated data",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/*
DEPRECATED: This route is now replaced by the GET /leaderboard endpoint.
Please migrate to the new /leaderboard?timeframe=<period>&limit=<value> endpoint 
which provides a unified data structure and more flexible querying.

// Leaderboard Top Performers
router.get("/leaderboard/top", async (req, res, next) => {
  try {
    const data = await withCache(
      "leaderboard-top-performers",
      async () => await statSyncService.getTopPerformers(10),
      { ttl: 60000, namespace: "leaderboard" } // 1 minute TTL
    );

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Top performers fetch error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : "Failed to fetch top performers"
      }
    });
  }
});
*/

// All wager races endpoint 
router.get("/wager-races/all", async (req, res, next) => {
  try {
    const data = await withCache(
      "all-races",
      async () => await raceService.getAllRaces(),
      { ttl: 60000, namespace: "races" } // 1 minute TTL
    );

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("All races fetch error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : "Failed to fetch all races data"
      }
    });
  }
});

// Platform health check endpoint
router.get("/health", async (req, res, next) => {
  try {
    const data = await withCache(
      "health-status",
      async () => ({
        status: "ok",
        timestamp: new Date().toISOString(),
        db: "connected", // Add proper DB health check if needed
        telegramBot: "not initialized" // Add proper bot status if needed
      }),
      { ttl: 5000, namespace: "health" } // 5 seconds TTL
    );

    res.json(data);
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : "Health check failed"
      }
    });
  }
});

/**
 * Unified Leaderboard API
 * Supports daily, weekly, monthly, all_time timeframes
 * Returns data in a standardized format
 */
router.get("/leaderboard", async (req, res, next) => {
  try {
    const querySchema = z.object({
      timeframe: z.enum(["daily", "weekly", "monthly", "all_time"]).default("monthly"),
      limit: z.coerce.number().int().positive().max(100).default(10),
      page: z.coerce.number().int().positive().default(1),
    });

    const validationResult = querySchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        status: "error",
        message: "Invalid query parameters",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { timeframe, limit, page } = validationResult.data;
    const offset = (page - 1) * limit;
    const cacheKey = `leaderboard-${timeframe}-limit-${limit}-page-${page}`;
    
    const data = await withCache(
      cacheKey,
      async () => {
        let wagerField: keyof typeof leaderboardUsers.$inferSelect;
        let wagerColumn;
        let whereCondition; // For total count query

        switch (timeframe) {
          case "daily":
            wagerField = "wager_today";
            wagerColumn = leaderboardUsers.wager_today;
            // whereCondition = gt(leaderboardUsers.wager_today, 0); // Example: if you only count active wagerers
            break;
          case "weekly":
            wagerField = "wager_week";
            wagerColumn = leaderboardUsers.wager_week;
            break;
          case "all_time":
            wagerField = "wager_all_time";
            wagerColumn = leaderboardUsers.wager_all_time;
            break;
          case "monthly":
          default:
            wagerField = "wager_month";
            wagerColumn = leaderboardUsers.wager_month;
            break;
        }

        if (!wagerColumn) {
          throw new Error("Invalid timeframe specified after validation.");
        }

        // Fetch paginated users
        const result = await db
          .select({
            userId: leaderboardUsers.uid,
            username: leaderboardUsers.name,
            wagered: wagerColumn,
            avatarUrl: mainUsersTable.profileImage,
          })
          .from(leaderboardUsers)
          .leftJoin(mainUsersTable, eq(leaderboardUsers.uid, mainUsersTable.goatedId))
          .orderBy(desc(wagerColumn))
          .limit(limit)
          .offset(offset);

        // Fetch total count for the given timeframe
        const totalCountResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(leaderboardUsers);
        const total = totalCountResult[0]?.count || 0;

        const entries = result.map((user, index) => {
          const rawWagered = user.wagered?.toString();
          let parsedWagered = parseFloat(rawWagered || "0");
          if (isNaN(parsedWagered)) {
            parsedWagered = 0;
          }

          return {
            userId: user.userId || "UNKNOWN_USER_ID", // Default if null/undefined
            username: user.username || "Unknown User", // Default if null/undefined
            wagered: parsedWagered,
            rank: offset + index + 1,
            avatarUrl: user.avatarUrl || null,
            won: 0,
            profit: 0,
            isCurrentUser: false,
          };
        });

        return {
          entries,
          timeframe,
          total,
          timestamp: Date.now(),
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      },
      { ttl: 60000, namespace: "leaderboard" }
    );

    res.json({
      status: "success",
      ...data,
    });
  } catch (error) {
    console.error("Error fetching unified leaderboard data:", error);
    // Pass to an error handling middleware if you have one set up globally for the router
    // For now, sending a generic error response
    if (error instanceof z.ZodError) { // Should be caught by validationResult.success check mostly
       return res.status(400).json({
        status: "error",
        message: "Validation error in leaderboard",
        errors: error.flatten().fieldErrors,
      });
    }
    res.status(500).json({
      status: "error",
      error: "Failed to fetch leaderboard data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Race Configuration API
 * Provides details about the current/upcoming race events.
 */
router.get("/race-config", async (req, res) => {
  try {
    // TODO: In the future, this data should be fetched from a database 
    // and be configurable via an admin panel.

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const startDate = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999); // Last day of current month
    const nextRaceStartDate = new Date(currentYear, currentMonth + 1, 1, 0, 0, 0, 0);

    let prizePoolValue = 500; // Hardcoded for now
    if (typeof prizePoolValue !== 'number' || isNaN(prizePoolValue)) {
        prizePoolValue = 0; // Default if somehow invalid
    }

    const raceConfig = {
      name: "Monthly Goated Race",
      description: "Compete with other Goats by wagering the most throughout the month to win cash prizes!",
      prizePool: prizePoolValue,
      currency: "USD",
      timeframe: "monthly", // Could be more dynamic later, e.g., specific race ID
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      nextRaceStartDate: nextRaceStartDate.toISOString(),
      status: now >= startDate && now <= endDate ? "active" : (now < startDate ? "upcoming" : "ended"),
      prizeDistribution: {
        1: 0.425, // $212.50
        2: 0.2,   // $100
        3: 0.15,  // $75 - corrected from $60
        4: 0.075, // $37.50 - corrected from $30
        5: 0.06,  // $30 - corrected from $24
        6: 0.04,  // $20 - corrected from $16
        7: 0.0275,// $13.75 - corrected from $11
        8: 0.0225,// $11.25 - corrected from $9
        9: 0.0175,// $8.75 - corrected from $7
        10: 0.0175// $8.75 - corrected from $7
      },
      totalWinners: 10,
    };

    // This endpoint can also be cached
    // For now, sending directly. Consider adding withCache if high traffic.
    res.json({
      success: true,
      data: raceConfig,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error fetching race configuration:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch race configuration",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;