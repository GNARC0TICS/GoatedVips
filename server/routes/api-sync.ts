/**
 * API Sync Management Routes
 * 
 * Provides endpoints to check sync status and manage the synchronization process
 */
import { Router } from "express";
import { db } from "@db";
import { sql } from "drizzle-orm";
import { apiSyncMetadata, users } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/admin";
import { log } from "../vite";
// We need to implement our own sync function since it's not exported from index.ts
import { API_CONFIG } from "../config/api";

// Simplified sync function that just triggers API requests
async function syncUserProfiles() {
  console.log("Fetching leaderboard data for manual sync...");

  const token = process.env.API_TOKEN || API_CONFIG.token;
  if (!token) {
    throw new Error("API token not configured");
  }

  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`;

  // Make API request
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
  }

  const rawData = await response.json();

  // Basic data normalization
  let allTimeData = [];
  if (Array.isArray(rawData)) {
    allTimeData = rawData;
  } else if (rawData.data && Array.isArray(rawData.data)) {
    allTimeData = rawData.data;
  } else if (rawData.results && Array.isArray(rawData.results)) {
    allTimeData = rawData.results;
  } else {
    console.log("Unexpected data format, checking for arrays");
    // Try to extract any array we can find
    const possibleArrays = Object.values(rawData).filter(value => Array.isArray(value));
    if (possibleArrays.length > 0) {
      allTimeData = possibleArrays.reduce((a: any, b: any) => a.length > b.length ? a : b);
    }
  }

  // Prioritize users that need updating rather than random selection
  const lastSyncTime = new Date();
  lastSyncTime.setHours(lastSyncTime.getHours() - 6); // Users not updated in last 6 hours
  
  // Find users who haven't been updated recently or have zero wagers (needing initial data)
  const needsUpdateUsers = await db
    .select({ goatedId: users.goatedId })
    .from(users)
    .where(
      sql`${users.lastActive} < ${lastSyncTime} OR ${users.total_wager} = 0`
    )
    .limit(50);
  
  // Map Goated IDs to find matching users from API data
  const goatedIdsToUpdate = new Set(needsUpdateUsers.map(u => u.goatedId));
  
  // Filter API data for users that need updates + add some random users if needed
  let usersToUpdate = allTimeData.filter(player => 
    player.uid && goatedIdsToUpdate.has(player.uid)
  );
  
  // If we have fewer than 50 users that match our criteria, add some random ones
  if (usersToUpdate.length < 50) {
    const remainingCount = 50 - usersToUpdate.length;
    const existingIds = new Set(usersToUpdate.map(u => u.uid));
    
    const randomUsers = allTimeData
      .filter(player => player.uid && !existingIds.has(player.uid))
      .sort(() => 0.5 - Math.random())
      .slice(0, remainingCount);
    
    usersToUpdate = [...usersToUpdate, ...randomUsers];
  }

  console.log(`Manual sync is updating ${usersToUpdate.length} users (${goatedIdsToUpdate.size} prioritized)`);

  let updatedCount = 0;

  for (const player of usersToUpdate) {
    try {
      // Skip entries without uid or name
      if (!player.uid || !player.name) continue;

      // Extract wager data from the player object
      const totalWager = player.wagered?.all_time || 0;
      const wagerToday = player.wagered?.today || 0;
      const wagerWeek = player.wagered?.this_week || 0;
      const wagerMonth = player.wagered?.this_month || 0;

      // Check if user exists and update
      const existingUser = await db.select().from(users)
        .where(sql`goated_id = ${player.uid}`)
        .limit(1);

      if (existingUser && existingUser.length > 0) {
        // Update existing user with latest wager data
        await db.execute(sql`
          UPDATE users 
          SET 
            goated_username = ${player.name},
            total_wager = ${totalWager},
            wager_today = ${wagerToday},
            wager_week = ${wagerWeek},
            wager_month = ${wagerMonth},
            lastActive = NOW(),
            isActive = ${totalWager > 0}
          WHERE goated_id = ${player.uid}
        `);
        updatedCount++;
      }
    } catch (error) {
      console.error(`Error updating user ${player?.name}:`, error);
    }
  }

  console.log(`Manual sync completed. ${updatedCount} profiles updated.`);
  return { updated: updatedCount, total: allTimeData.length };
}

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

/**
 * Get all sync metadata records
 * Shows the history of API synchronizations
 */
router.get("/history", async (_req, res) => {
  try {
    const syncRecords = await db.query.apiSyncMetadata.findMany({
      orderBy: [desc(apiSyncMetadata.last_sync_time)],
      limit: 50
    });

    res.json({
      status: "success",
      data: syncRecords
    });
  } catch (error) {
    console.error("Error fetching sync history:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch sync history",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get information about the most recent sync
 */
router.get("/status", async (_req, res) => {
  try {
    const [lastSync] = await db.query.apiSyncMetadata.findMany({
      orderBy: [desc(apiSyncMetadata.last_sync_time)],
      limit: 1
    });

    // Calculate time since last sync
    const timeSinceSync = lastSync 
      ? Date.now() - lastSync.last_sync_time.getTime()
      : null;

    const timeSinceSyncMinutes = timeSinceSync 
      ? Math.floor(timeSinceSync / (1000 * 60))
      : null;

    res.json({
      status: "success",
      data: {
        lastSync,
        timeSinceSyncMs: timeSinceSync,
        timeSinceSyncMinutes,
        timeSinceSyncFormatted: timeSinceSyncMinutes 
          ? `${timeSinceSyncMinutes} minute${timeSinceSyncMinutes !== 1 ? 's' : ''} ago` 
          : 'Never synced'
      }
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch sync status",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get user count information
 */
router.get("/user-stats", async (_req, res) => {
  try {
    const [userCount] = await db
      .select({ count: sql`count(*)` })
      .from(users);

    const [userWithGoatedIds] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(sql`goated_id IS NOT NULL`);

    const [usersWithWagerData] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(sql`wagered_all_time > 0`);

    res.json({
      status: "success",
      data: {
        totalUsers: userCount.count,
        usersWithGoatedIds: userWithGoatedIds.count,
        usersWithWagerData: usersWithWagerData.count,
        percentWithGoatedIds: userCount.count 
          ? Math.round((Number(userWithGoatedIds.count) / Number(userCount.count)) * 100)
          : 0,
        percentWithWagerData: userCount.count 
          ? Math.round((Number(usersWithWagerData.count) / Number(userCount.count)) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user stats",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Trigger a manual sync
 */
router.post("/trigger", async (_req, res) => {
  try {
    log("Manual sync triggered via API");

    // Start the sync process (non-blocking)
    const syncPromise = syncUserProfiles();

    // Don't wait for it to complete, just acknowledge the request
    res.json({
      status: "success",
      message: "Sync process initiated",
      note: "The sync is running in the background. Check status endpoints for completion."
    });

    // Handle the sync completion in the background
    syncPromise
      .then(() => {
        log("Manual sync completed successfully");
      })
      .catch((error) => {
        log(`Manual sync failed: ${error.message}`);
      });

  } catch (error) {
    console.error("Error triggering sync:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to trigger sync",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;