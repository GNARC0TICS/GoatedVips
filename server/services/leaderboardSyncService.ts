import goatedApiService from './goatedApiService';
import { db } from '../../db';
import { leaderboardUsers } from '../../db/schema';
import { sql } from 'drizzle-orm';

/**
 * Optimized leaderboard sync service
 * - Only processes active users (all_time wager > 0)
 * - Uses batch operations for better performance
 * - Tracks sync metrics for monitoring
 */

interface SyncResult {
  activeUsers: number;
  totalUsers: number;
  updated: number;
  skipped: number;
  duration: number;
}

export async function syncLeaderboardUsers(): Promise<SyncResult> {
  console.log('LeaderboardSyncService: Starting optimized sync...');
  const startTime = Date.now();
  
  try {
    // Fetch data from external API
    const rawData = await goatedApiService.fetchReferralData();
    if (!rawData || !rawData.data) {
      throw new Error('No data from external API');
    }

    // Normalize data array - handle different API response formats
    let users: any[] = [];
    if (Array.isArray(rawData.data)) {
      users = rawData.data;
    } else if (rawData.data.data && Array.isArray(rawData.data.data)) {
      users = rawData.data.data;
    } else {
      throw new Error('Unexpected API response format');
    }

    console.log(`LeaderboardSyncService: Received ${users.length} total users from API`);
    
    // Filter to only active users (those with any wager activity)
    const activeUsers = users.filter(user => {
      if (!user.uid || !user.name) return false;
      
      // Only include users with all-time wager > 0 to reduce database bloat
      const allTimeWager = parseFloat(user.wagered?.all_time || 0);
      return allTimeWager > 0;
    });
    
    console.log(`LeaderboardSyncService: Filtered to ${activeUsers.length} active users (${(activeUsers.length/users.length*100).toFixed(1)}% of total)`);
    
    if (activeUsers.length === 0) {
      console.log('LeaderboardSyncService: No active users to sync');
      return {
        activeUsers: 0,
        totalUsers: users.length,
        updated: 0,
        skipped: users.length,
        duration: Date.now() - startTime
      };
    }

    // Batch process active users using optimized upsert
    let updated = 0;
    const batchSize = 50; // Process in smaller batches for better memory usage
    
    for (let i = 0; i < activeUsers.length; i += batchSize) {
      const batch = activeUsers.slice(i, i + batchSize);
      
      for (const user of batch) {
        try {
          await db.insert(leaderboardUsers)
            .values({
              uid: user.uid,
              name: user.name,
              wagerToday: String(user.wagered?.today || 0),
              wagerWeek: String(user.wagered?.this_week || 0),
              wagerMonth: String(user.wagered?.this_month || 0),
              wagerAllTime: String(user.wagered?.all_time || 0),
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: leaderboardUsers.uid,
              set: {
                name: user.name,
                wagerToday: String(user.wagered?.today || 0),
                wagerWeek: String(user.wagered?.this_week || 0),
                wagerMonth: String(user.wagered?.this_month || 0),
                wagerAllTime: String(user.wagered?.all_time || 0),
                updatedAt: new Date(),
              },
            });
          
          updated++;
        } catch (error) {
          console.error(`Error upserting user ${user.uid}:`, error);
        }
      }
      
      // Small delay between batches to prevent overwhelming the database
      if (i + batchSize < activeUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    const duration = Date.now() - startTime;
    const skipped = users.length - activeUsers.length;
    
    console.log(`LeaderboardSyncService: Optimized sync completed in ${duration}ms`);
    console.log(`  - Active users processed: ${activeUsers.length}`);
    console.log(`  - Users updated: ${updated}`);
    console.log(`  - Inactive users skipped: ${skipped}`);
    console.log(`  - Performance: ${(activeUsers.length / (duration / 1000)).toFixed(0)} users/sec`);
    
    return {
      activeUsers: activeUsers.length,
      totalUsers: users.length,
      updated,
      skipped,
      duration
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('LeaderboardSyncService: Sync failed:', error);
    throw error;
  }
}

/**
 * Schedules recurring leaderboard sync every 10 minutes
 */
export function startLeaderboardSyncScheduler() {
  console.log('LeaderboardSyncService: Starting recurring sync scheduler (10 minute intervals)');
  
  // Run immediately on startup
  syncLeaderboardUsers()
    .then(result => {
      console.log('LeaderboardSyncService: Initial scheduled sync completed:', result);
    })
    .catch(error => {
      console.error('LeaderboardSyncService: Initial scheduled sync failed:', error);
    });
  
  // Schedule recurring sync every 10 minutes
  setInterval(async () => {
    try {
      console.log('LeaderboardSyncService: Running scheduled sync...');
      const result = await syncLeaderboardUsers();
      console.log('LeaderboardSyncService: Scheduled sync completed:', result);
    } catch (error) {
      console.error('LeaderboardSyncService: Scheduled sync failed:', error);
    }
  }, 10 * 60 * 1000); // 10 minutes in milliseconds
} 