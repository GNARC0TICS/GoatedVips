import { pgTable, serial, text, numeric, timestamp } from 'drizzle-orm/pg-core';
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
}); 