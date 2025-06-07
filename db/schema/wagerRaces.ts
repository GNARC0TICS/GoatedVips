import { pgTable, serial, text, numeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const wagerRaces = pgTable('wager_races', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  prizePool: numeric('prize_pool', { precision: 18, scale: 2 }).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  minWager: numeric('min_wager', { precision: 18, scale: 2 }).default('0').notNull(),
  prizeDistribution: jsonb('prize_distribution').default('{}').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  rules: text('rules'),
  description: text('description'),
  name: text('name'),
}); 