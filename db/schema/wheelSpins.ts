import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const wheelSpins = pgTable("wheel_spins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  segmentIndex: integer("segment_index").notNull(),
  rewardCode: text("reward_code"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
});

export const wheelSpinRelations = relations(wheelSpins, ({ one }) => ({
  user: one(users, {
    fields: [wheelSpins.userId],
    references: [users.id],
  }),
}));

// Export types
export type InsertWheelSpin = typeof wheelSpins.$inferInsert;
export type SelectWheelSpin = typeof wheelSpins.$inferSelect; 