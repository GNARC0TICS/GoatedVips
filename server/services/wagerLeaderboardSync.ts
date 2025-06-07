import { db } from '../../db';
import { goatedWagerLeaderboard } from '../../db/schema';
import { eq } from 'drizzle-orm';
import goatedApiService from './goatedApiService';

// Sync interval in ms (10 minutes)
const SYNC_INTERVAL = 10 * 60 * 1000;

export async function syncGoatedWagerLeaderboard() {
  const response = await goatedApiService.fetchReferralData(true);
  const apiData = response.data || response; // Handle both response.data and direct array

  for (const user of apiData) {
    const dbUser = await db.select().from(goatedWagerLeaderboard).where(eq(goatedWagerLeaderboard.uid, user.uid)).limit(1);

          if (!dbUser || dbUser.length === 0) {
      // Insert new user
      await db.insert(goatedWagerLeaderboard).values({
        uid: user.uid,
        name: user.name, // Only on first insert
        wagered_today: user.wagered.today,
        wagered_this_week: user.wagered.this_week,
        wagered_this_month: user.wagered.this_month,
        wagered_all_time: user.wagered.all_time,
        last_synced: new Date(),
      });
          } else {
        // Only update wager fields if changed
        const currentUser = dbUser[0];
        const wagerChanged =
          currentUser.wagered_today !== user.wagered.today ||
          currentUser.wagered_this_week !== user.wagered.this_week ||
          currentUser.wagered_this_month !== user.wagered.this_month ||
          currentUser.wagered_all_time !== user.wagered.all_time;

      if (wagerChanged) {
        await db.update(goatedWagerLeaderboard)
          .set({
            wagered_today: user.wagered.today,
            wagered_this_week: user.wagered.this_week,
            wagered_this_month: user.wagered.this_month,
            wagered_all_time: user.wagered.all_time,
            last_synced: new Date(),
          })
          .where(eq(goatedWagerLeaderboard.uid, user.uid));
      }
    }
  }
}

// Run on startup (non-blocking)
syncGoatedWagerLeaderboard().catch(error => {
  console.error('Initial wager leaderboard sync failed:', error);
});

// Schedule periodic sync
setInterval(() => {
  syncGoatedWagerLeaderboard().catch(error => {
    console.error('Scheduled wager leaderboard sync failed:', error);
  });
}, SYNC_INTERVAL); 