import { pgTable, serial, text, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const leaderboardUsers = pgTable('leaderboard_users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull(),
  wagerToday: numeric('wager_today', { precision: 18, scale: 8 }).default('0').notNull(),
  wagerWeek: numeric('wager_week', { precision: 18, scale: 8 }).default('0').notNull(),
  wagerMonth: numeric('wager_month', { precision: 18, scale: 8 }).default('0').notNull(),
  wagerAllTime: numeric('wager_all_time', { precision: 18, scale: 8 }).default('0').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  // Optimized indexes for leaderboard queries
  wagerTodayIdx: index('leaderboard_wager_today_idx').on(table.wagerToday.desc()),
  wagerWeekIdx: index('leaderboard_wager_week_idx').on(table.wagerWeek.desc()),
  wagerMonthIdx: index('leaderboard_wager_month_idx').on(table.wagerMonth.desc()),
  wagerAllTimeIdx: index('leaderboard_wager_all_time_idx').on(table.wagerAllTime.desc()),
  updatedAtIdx: index('leaderboard_updated_at_idx').on(table.updatedAt.desc()),
})); 