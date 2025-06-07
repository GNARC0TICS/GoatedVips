import { pgTable, serial, integer, text, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const mockWagerData = pgTable("mock_wager_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  username: text("username").notNull(),
  wageredToday: decimal("wagered_today", { precision: 18, scale: 8 }).default("0").notNull(),
  wageredThisWeek: decimal("wagered_this_week", { precision: 18, scale: 8 }).default("0").notNull(),
  wageredThisMonth: decimal("wagered_this_month", { precision: 18, scale: 8 }).default("0").notNull(),
  wageredAllTime: decimal("wagered_all_time", { precision: 18, scale: 8 }).default("0").notNull(),
  isMocked: boolean("is_mocked").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
});

export const mockWagerDataRelations = relations(mockWagerData, ({ one }) => ({
  user: one(users, {
    fields: [mockWagerData.userId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [mockWagerData.createdBy],
    references: [users.id],
  }),
}));

// Export types
export type InsertMockWagerData = typeof mockWagerData.$inferInsert;
export type SelectMockWagerData = typeof mockWagerData.$inferSelect; 