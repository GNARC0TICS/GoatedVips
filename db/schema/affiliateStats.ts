import { pgTable, serial, decimal, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const affiliateStats = pgTable("affiliate_stats", {
  id: serial("id").primaryKey(),
  // userId: integer("user_id").references(() => users.id),
  totalWager: decimal("total_wager", { precision: 18, scale: 8 }).notNull(),
  commission: decimal("commission", { precision: 18, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

// export const affiliateStatsRelations = relations(affiliateStats, ({ one }) => ({
//   user: one(users, {
//     fields: [affiliateStats.userId],
//     references: [users.id],
//   }),
// }));

// Export types
export type InsertAffiliateStats = typeof affiliateStats.$inferInsert;
export type SelectAffiliateStats = typeof affiliateStats.$inferSelect; 