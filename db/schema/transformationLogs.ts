import { pgTable, serial, text, jsonb, numeric, timestamp, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const transformationLogs = pgTable('transformation_logs', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  message: text('message').notNull(),
  payload: jsonb('payload'),
  durationMs: numeric('duration_ms', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  resolved: boolean('resolved').default(false).notNull(),
  errorMessage: text('error_message'),
});

export type InsertTransformationLog = typeof transformationLogs.$inferInsert;
export type SelectTransformationLog = typeof transformationLogs.$inferSelect; 