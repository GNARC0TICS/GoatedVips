import { pgTable, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const goatedWagerLeaderboard = pgTable('goated_wager_leaderboard', {
  uid: text('uid').primaryKey(),
  name: text('name').notNull(),
  wageredToday: numeric('wagered_today', { precision: 18, scale: 8 }).default('0').notNull(),
  wageredThisWeek: numeric('wagered_this_week', { precision: 18, scale: 8 }).default('0').notNull(),
  wageredThisMonth: numeric('wagered_this_month', { precision: 18, scale: 8 }).default('0').notNull(),
  wageredAllTime: numeric('wagered_all_time', { precision: 18, scale: 8 }).default('0').notNull(),
  lastSynced: timestamp('last_synced', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}); 