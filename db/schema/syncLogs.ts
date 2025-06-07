import { pgTable, serial, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const syncLogs = pgTable('sync_logs', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  durationMs: numeric('duration_ms', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}); 