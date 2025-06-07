import { db } from '../../db';
import { goatedWagerLeaderboard } from '../../db/schema';
import goatedApiService from './goatedApiService';

// Sync interval in ms (10 minutes)
const SYNC_INTERVAL = 10 * 60 * 1000;

export async function syncGoatedWagerLeaderboard() {
  const apiData = await goatedApiService.fetchReferralData(true);

  for (const user of apiData) {
    const dbUser = await db.query.goatedWagerLeaderboard.findFirst({ where: { uid: user.uid } });

    if (!dbUser) {
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
      const wagerChanged =
        dbUser.wagered_today !== user.wagered.today ||
        dbUser.wagered_this_week !== user.wagered.this_week ||
        dbUser.wagered_this_month !== user.wagered.this_month ||
        dbUser.wagered_all_time !== user.wagered.all_time;

      if (wagerChanged) {
        await db.update(goatedWagerLeaderboard)
          .set({
            wagered_today: user.wagered.today,
            wagered_this_week: user.wagered.this_week,
            wagered_this_month: user.wagered.this_month,
            wagered_all_time: user.wagered.all_time,
            last_synced: new Date(),
          })
          .where({ uid: user.uid });
      }
    }
  }
}

// Run on startup
syncGoatedWagerLeaderboard();

// Schedule periodic sync
setInterval(syncGoatedWagerLeaderboard, SYNC_INTERVAL); 