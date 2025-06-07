import { pgTable, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  // userId: integer("user_id").references(() => users.id).unique(), 
  wagerRaceUpdates: boolean("wager_race_updates").default(true).notNull(),
  vipStatusChanges: boolean("vip_status_changes").default(true).notNull(),
  promotionalOffers: boolean("promotional_offers").default(true).notNull(),
  monthlyStatements: boolean("monthly_statements").default(true).notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
//   user: one(users, {
//     fields: [notificationPreferences.userId],
//     references: [users.id],
//   }),
// }));

// Export types
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;
export type SelectNotificationPreference = typeof notificationPreferences.$inferSelect; 