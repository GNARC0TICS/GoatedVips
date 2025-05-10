import { pgTable, uuid, varchar, timestamp, decimal, index } from 'drizzle-orm/pg-core';

export const wagerRaces = pgTable('wager_races', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: varchar('status', { length: 255 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  prizePool: decimal('prize_pool', { precision: 19, scale: 4 }),
}, (table) => ({
  statusIdx: index('idx_wager_races_status').on(table.status),
})); 