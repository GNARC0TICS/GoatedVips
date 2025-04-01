import { pgTable, serial, varchar, decimal, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const wagerOverrides = pgTable('wager_overrides', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  goated_id: varchar('goated_id', { length: 255 }),
  today_override: decimal('today_override', { precision: 20, scale: 8 }),
  this_week_override: decimal('this_week_override', { precision: 20, scale: 8 }),
  this_month_override: decimal('this_month_override', { precision: 20, scale: 8 }),
  all_time_override: decimal('all_time_override', { precision: 20, scale: 8 }),
  active: boolean('active').notNull().default(true),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  created_by: varchar('created_by', { length: 255 }),
  notes: varchar('notes', { length: 1000 }),
}, (table) => {
  return {
    username_idx: index('idx_wager_overrides_username').on(table.username),
    goated_id_idx: index('idx_wager_overrides_goated_id').on(table.goated_id),
    active_idx: index('idx_wager_overrides_active').on(table.active),
  };
});

// Optionally define relations to users table if needed
export const wagerOverrideRelations = relations(wagerOverrides, ({ one }) => ({
  createdBy: one(users, {
    fields: [wagerOverrides.created_by],
    references: [users.username],
  }),
}));

// Create Zod schemas for type validation
export const insertWagerOverrideSchema = createInsertSchema(wagerOverrides);
export const selectWagerOverrideSchema = createSelectSchema(wagerOverrides);

// Export types for use in TypeScript
export type InsertWagerOverride = typeof wagerOverrides.$inferInsert;
export type SelectWagerOverride = typeof wagerOverrides.$inferSelect;