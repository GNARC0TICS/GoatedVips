import { pgTable, uuid, varchar, timestamp, decimal, index, text, jsonb, integer } from 'drizzle-orm/pg-core';

export const wagerRaces = pgTable('wager_races', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull().default('monthly'), // e.g., monthly, weekly, special
  status: varchar('status', { length: 50 }).notNull().default('upcoming'), // upcoming, live, completed, archived
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  prizePool: decimal('prize_pool', { precision: 19, scale: 4 }).notNull().default('0.00'),
  minWager: decimal('min_wager', { precision: 19, scale: 4 }).default('0.00'),
  rules: text('rules'),
  prizeDistribution: jsonb('prize_distribution'), // e.g., {"1": 50, "2": 30, "3": 20} (percentage or fixed amount)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  statusIdx: index('idx_wager_races_status').on(table.status),
  typeIdx: index('idx_wager_races_type').on(table.type),
  endDateIdx: index('idx_wager_races_end_date').on(table.endDate),
})); 