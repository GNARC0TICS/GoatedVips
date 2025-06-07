import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  isSubscribed: boolean("is_subscribed").default(true).notNull(),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  source: text("source"),
});

// Export types
export type InsertNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;
export type SelectNewsletterSubscription = typeof newsletterSubscriptions.$inferSelect; 