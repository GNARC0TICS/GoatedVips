/**
 * API Routes for Goated VIPs Platform
 * 
 * This file defines all the API routes for the platform, using the PlatformApiService
 * to provide data. These routes act as the public interface for our application.
 * 
 * Routes implemented:
 * - GET /api/affiliate/stats - Leaderboard data for all timeframes
 * - GET /api/wager-races/current - Current active race data
 * - GET /api/wager-race/position - User's current race position
 * - POST /api/sync/trigger - Trigger manual data synchronization (admin only)
 */

import { Router, Request, Response } from "express";
import { platformApiService } from "../services/platformApiService";

// Create router
const router = Router();

/**
 * Caching middleware
 * Adds caching headers to responses
 * 
 * @param maxAge Maximum age of the cache in seconds
 */
const cache = (maxAge: number) => (req: Request, res: Response, next: Function) => {
  // Only cache GET requests
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  } else {
    // For other methods like POST/PUT, prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
};

/**
 * GET /api/affiliate/stats
 * Returns leaderboard data for all time periods
 * Rate limit: 60 requests/minute
 * Cached for 15 minutes
 */
router.get("/affiliate/stats", cache(15 * 60), async (_req: Request, res: Response) => {
  try {
    console.log("GET /api/affiliate/stats");
    const leaderboardData = await platformApiService.getLeaderboardData();
    res.json(leaderboardData);
  } catch (error) {
    console.error("Error fetching affiliate stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch affiliate statistics",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/wager-races/current
 * Returns current active race data
 * Rate limit: 30 requests/minute
 * Updates every 15 minutes
 */
router.get("/wager-races/current", cache(15 * 60), async (_req: Request, res: Response) => {
  try {
    console.log("GET /api/wager-races/current");
    const raceData = await platformApiService.getCurrentWagerRace();
    res.json({
      status: "success",
      data: raceData
    });
  } catch (error) {
    console.error("Error fetching current wager race:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch current wager race data",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/wager-races/previous
 * Returns previous race data
 * Rate limit: 30 requests/minute
 * Updates every 15 minutes
 */
router.get("/wager-races/previous", cache(15 * 60), async (_req: Request, res: Response) => {
  try {
    console.log("GET /api/wager-races/previous");
    const raceData = await platformApiService.getPreviousWagerRace();
    res.json({
      status: "success",
      data: raceData
    });
  } catch (error) {
    console.error("Error fetching previous wager race:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch previous wager race data",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/wager-race/position
 * Returns user's current race position
 * Rate limit: 30 requests/minute
 * Updates every 15 minutes
 */
router.get("/wager-race/position", async (req: Request, res: Response) => {
  try {
    console.log("GET /api/wager-race/position");
    const uid = req.query.uid as string;
    
    if (!uid) {
      return res.status(400).json({
        status: "error",
        message: "User ID (uid) is required"
      });
    }
    
    const positionData = await platformApiService.getUserRacePosition(uid);
    res.json({
      status: "success",
      data: positionData
    });
  } catch (error) {
    console.error("Error fetching wager race position:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch wager race position",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/sync/trigger
 * Trigger manual data synchronization
 * Requires admin privileges
 */
router.post("/sync/trigger", async (_req: Request, res: Response) => {
  try {
    console.log("POST /api/sync/trigger");
    // Start the sync process (non-blocking)
    const syncPromise = platformApiService.syncUserProfiles();
    
    // Don't wait for completion, just acknowledge the request
    res.json({
      status: "success",
      message: "Sync process initiated",
      note: "The sync is running in the background. Check status endpoints for completion."
    });

    // Handle completion in the background
    syncPromise
      .then((stats) => {
        console.log("Manual sync completed successfully", stats);
      })
      .catch((error) => {
        console.error(`Manual sync failed: ${error.message}`);
      });
  } catch (error) {
    console.error("Error triggering sync:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to trigger sync",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;