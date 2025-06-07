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

const router = Router();

/**
 * Get affiliate stats and leaderboard data
 * Used by the admin dashboard and leaderboard components
 */
router.get("/affiliate/stats", async (req, res, next) => {
  try {
    const data = await cacheService.getOrSet(
      "stats_aggregate",
      () => statSyncService.getAggregatedStats(),
      30
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * Get current wager race data
 * Used by the wager race page to display current competition
 */
router.get("/wager-races/current", async (req, res, next) => {
  try {
    const data = await cacheService.getOrSet(
      "current_race",
      () => raceService.getCurrentRace(),
      30
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * Get previous wager race data
 * Used by the wager race page to display historical results
 */
router.get("/wager-races/previous", async (req, res, next) => {
  try {
    const data = await cacheService.getOrSet(
      "previous_race",
      () => raceService.getPreviousRace(),
      30
    );
    res.json(data);
  } catch (err) {
    next(err);
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
    
    // Get leaderboard data first
    const leaderboardData = await statSyncService.getLeaderboardData();
    
    // Get user position using raceService
    const positionData = await raceService.getUserRacePosition(uid, leaderboardData);
    
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

// Leaderboard Top Performers
router.get("/leaderboard/top", async (req, res, next) => {
  try {
    const data = await cacheService.getOrSet(
      "leaderboard_top_performers",
      () => statSyncService.getTopPerformers(10),
      60 // seconds TTL
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;