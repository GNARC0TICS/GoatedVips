import { pgTable, uuid, varchar, text, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const transformationLogs = pgTable('transformation_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 255 }),
  message: text('message'),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  typeIdx: index('idx_transformation_logs_type').on(table.type),
})); 