import goatedApiService from './goatedApiService';
import { db } from '../../db';
import { leaderboardUsers } from '../../db/schema';
import { sql } from 'drizzle-orm';

export async function syncLeaderboardUsers() {
  console.log('LeaderboardSyncService: Starting sync...');
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

    console.log(`LeaderboardSyncService: Processing ${users.length} users`);
    
    // Log sample user data structure for debugging
    if (users.length > 0) {
      console.log('Sample user data structure:', JSON.stringify(users[0], null, 2));
      
      // Find users with non-zero wagering amounts
      const nonZeroUsers = users.filter(u => 
        (u.wagered?.today && u.wagered.today > 0) ||
        (u.wagered?.this_week && u.wagered.this_week > 0) ||
        (u.wagered?.this_month && u.wagered.this_month > 0) ||
        (u.wagered?.all_time && u.wagered.all_time > 0)
      );
      console.log(`Found ${nonZeroUsers.length} users with non-zero wagering amounts`);
      
      if (nonZeroUsers.length > 0) {
        console.log('Sample non-zero user:', JSON.stringify(nonZeroUsers[0], null, 2));
      }
    }
    
    let created = 0;
    let updated = 0;
    let unchanged = 0;

    for (const user of users) {
      if (!user.uid || !user.name) {
        console.warn(`Skipping user with missing uid or name:`, user);
        continue;
      }

      try {
        // Use Drizzle's upsert functionality
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
        
        // For simplicity, count all as updated for now
        updated++;
      } catch (error) {
        console.error(`Error upserting user ${user.uid}:`, error);
        unchanged++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`LeaderboardSyncService: Sync completed in ${duration}ms. Updated: ${updated}, Unchanged: ${unchanged}`);
    
    return { created, updated, unchanged, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('LeaderboardSyncService: Sync failed:', error);
    throw error;
  }
} 