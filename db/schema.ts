import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  boolean,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations, sql } from "drizzle-orm";

// Users table - using basic schema that still maintains essential fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  emailVerified: boolean("email_verified").default(false),
  // Profile fields
  bio: text("bio"),
  profileColor: text("profile_color").default('#D7FF00'),
  goatedId: text("goated_id").unique(),
  goatedUsername: text("goated_username"),
  goatedAccountLinked: boolean("goated_account_linked").default(false),
  goatedLinkRequested: boolean("goated_link_requested").default(false),
  goatedUsernameRequested: text("goated_username_requested"),
  goatedLinkRequestedAt: timestamp("goated_link_requested_at"),
  totalWager: text("total_wager"),
  dailyWager: text("daily_wager"),
  weeklyWager: text("weekly_wager"),
  monthlyWager: text("monthly_wager"),
  lastUpdated: timestamp("last_updated"),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationSentAt: timestamp("email_verification_sent_at"),
  emailVerifiedAt: timestamp("email_verified_at"),
  lastActive: timestamp("last_active"),
});

// Simplify relations to avoid module import issues
export const userRelations = relations(users, ({ many }) => ({
  // Keep only core relations
  wheelSpins: many(wheelSpins),
  wagerRaceParticipations: many(wagerRaceParticipants),
}));

// Export schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Export types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

// No re-exports to avoid module reference issues

// Wheel spins table
export const wheelSpins = pgTable("wheel_spins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  segmentIndex: integer("segment_index").notNull(),
  rewardCode: text("reward_code"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Bonus codes table
export const bonusCodes = pgTable("bonus_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
});

// Wager races and related tables
export const wagerRaces = pgTable("wager_races", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'weekly' | 'monthly' | 'weekend'
  status: text("status").notNull(), // 'upcoming' | 'live' | 'completed'
  prizePool: decimal("prize_pool", { precision: 18, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  minWager: decimal("min_wager", { precision: 18, scale: 2 }).default("0").notNull(),
  prizeDistribution: jsonb("prize_distribution").default({}).notNull(), // { "1": 25, "2": 15, ... }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  rules: text("rules"),
  description: text("description"),
  name: text("name"), // Added for backwards compatibility
});

export const wagerRaceParticipants = pgTable("wager_race_participants", {
  id: serial("id").primaryKey(),
  raceId: integer("race_id").references(() => wagerRaces.id),
  userId: integer("user_id").references(() => users.id),  // Reference to internal users
  username: text("username").notNull(),                   // Store username directly
  wagered: decimal("wagered", { precision: 18, scale: 2 }).notNull(), // Total amount wagered
  position: integer("position").notNull(),                // Position in the race (1st, 2nd, etc.)
  prizeAmount: decimal("prize_amount", { precision: 18, scale: 2 }).default("0"),
  prizeClaimed: boolean("prize_claimed").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  wagerHistory: jsonb("wager_history"),                   // Track wager progress over time
  // Keeping column compatibility with actual database schema
  totalWager: decimal("total_wager_backup", { precision: 18, scale: 2 }),
  rank: integer("rank_backup"),
});

// Support System tables
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // 'open' | 'in_progress' | 'closed'
  priority: text("priority").notNull().default("medium"), // 'low' | 'medium' | 'high'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ticketMessages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isStaffReply: boolean("is_staff_reply").default(false).notNull(),
});

// Relations
export const wheelSpinRelations = relations(wheelSpins, ({ one }) => ({
  user: one(users, {
    fields: [wheelSpins.userId],
    references: [users.id],
  }),
}));

export const bonusCodeRelations = relations(bonusCodes, ({ one }) => ({
  user: one(users, {
    fields: [bonusCodes.userId],
    references: [users.id],
  }),
}));

export const wagerRaceRelations = relations(wagerRaces, ({ many }) => ({
  participants: many(wagerRaceParticipants),
}));

export const wagerRaceParticipantRelations = relations(
  wagerRaceParticipants,
  ({ one }) => ({
    race: one(wagerRaces, {
      fields: [wagerRaceParticipants.raceId],
      references: [wagerRaces.id],
    }),
    user: one(users, {
      fields: [wagerRaceParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const supportTicketRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  messages: many(ticketMessages),
}));

export const ticketMessageRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketMessages.ticketId],
    references: [supportTickets.id],
  }),
  user: one(users, {
    fields: [ticketMessages.userId],
    references: [users.id],
  }),
}));

// Schema validation with Zod
export const insertWheelSpinSchema = createInsertSchema(wheelSpins);
export const selectWheelSpinSchema = createSelectSchema(wheelSpins);
export const insertBonusCodeSchema = createInsertSchema(bonusCodes);
export const selectBonusCodeSchema = createSelectSchema(bonusCodes);

export const insertWagerRaceSchema = createInsertSchema(wagerRaces);
export const selectWagerRaceSchema = createSelectSchema(wagerRaces);
export const insertWagerRaceParticipantSchema = createInsertSchema(
  wagerRaceParticipants,
);
export const selectWagerRaceParticipantSchema = createSelectSchema(
  wagerRaceParticipants,
);
export const insertSupportTicketSchema = createInsertSchema(supportTickets);
export const selectSupportTicketSchema = createSelectSchema(supportTickets);
export const insertTicketMessageSchema = createInsertSchema(ticketMessages);
export const selectTicketMessageSchema = createSelectSchema(ticketMessages);

// TypeScript type definitions
export type InsertWheelSpin = typeof wheelSpins.$inferInsert;
export type SelectWheelSpin = typeof wheelSpins.$inferSelect;
export type InsertBonusCode = typeof bonusCodes.$inferInsert;
export type SelectBonusCode = typeof bonusCodes.$inferSelect;

export type InsertWagerRace = typeof wagerRaces.$inferInsert;
export type SelectWagerRace = typeof wagerRaces.$inferSelect;
export type InsertWagerRaceParticipant = typeof wagerRaceParticipants.$inferInsert;
export type SelectWagerRaceParticipant = typeof wagerRaceParticipants.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;
export type SelectSupportTicket = typeof supportTickets.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;
export type SelectTicketMessage = typeof ticketMessages.$inferSelect;


// Temporarily removing challenge imports to resolve issues

export const historicalRaces = pgTable("historical_races", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  year: text("year").notNull(),
  prizePool: decimal("prize_pool", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  participants: jsonb("participants").notNull(),
  totalWagered: decimal("total_wagered", { precision: 18, scale: 2 }).notNull(),
  participantCount: text("participant_count").notNull(),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  isSubscribed: boolean("is_subscribed").default(true).notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  source: text("source"),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  wagerRaceUpdates: boolean("wager_race_updates").default(true).notNull(),
  vipStatusChanges: boolean("vip_status_changes").default(true).notNull(),
  promotionalOffers: boolean("promotional_offers").default(true).notNull(),
  monthlyStatements: boolean("monthly_statements").default(true).notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const affiliateStats = pgTable("affiliate_stats", {
  id: serial("id").primaryKey(),
  totalWager: decimal("total_wager", { precision: 18, scale: 8 }).notNull(),
  commission: decimal("commission", { precision: 18, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const mockWagerData = pgTable("mock_wager_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  username: text("username").notNull(),
  wageredToday: decimal("wagered_today", { precision: 18, scale: 8 })
    .default("0")
    .notNull(),
  wageredThisWeek: decimal("wagered_this_week", { precision: 18, scale: 8 })
    .default("0")
    .notNull(),
  wageredThisMonth: decimal("wagered_this_month", { precision: 18, scale: 8 })
    .default("0")
    .notNull(),
  wageredAllTime: decimal("wagered_all_time", { precision: 18, scale: 8 })
    .default("0")
    .notNull(),
  isMocked: boolean("is_mocked").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const transformationLogs = pgTable("transformation_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'info' | 'error' | 'warning'
  message: text("message").notNull(),
  payload: jsonb("payload"),
  duration_ms: decimal("duration_ms", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  error_message: text("error_message"),
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(
  newsletterSubscriptions,
);
export const selectNewsletterSubscriptionSchema = createSelectSchema(
  newsletterSubscriptions,
);
export const insertHistoricalRaceSchema = createInsertSchema(historicalRaces);
export const selectHistoricalRaceSchema = createSelectSchema(historicalRaces);
export const insertAffiliateStatsSchema = createInsertSchema(affiliateStats);
export const selectAffiliateStatsSchema = createSelectSchema(affiliateStats);


export const insertMockWagerDataSchema = createInsertSchema(mockWagerData);
export const selectMockWagerDataSchema = createSelectSchema(mockWagerData);
export type InsertMockWagerData = typeof mockWagerData.$inferInsert;
export type SelectMockWagerData = typeof mockWagerData.$inferSelect;

export type InsertNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;
export type SelectNewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertHistoricalRace = typeof historicalRaces.$inferInsert;
export type SelectHistoricalRace = typeof historicalRaces.$inferSelect;
export type InsertAffiliateStats = typeof affiliateStats.$inferInsert;
export type SelectAffiliateStats = typeof affiliateStats.$inferSelect;

export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // Type of sync: 'profile', 'wager', etc.
  status: text("status").notNull(), // 'success', 'error', 'pending'
  error_message: text("error_message"),
  duration_ms: decimal("duration_ms", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransformationLogSchema = createInsertSchema(transformationLogs);
export const selectTransformationLogSchema = createSelectSchema(transformationLogs);
export const insertSyncLogSchema = createInsertSchema(syncLogs);
export const selectSyncLogSchema = createSelectSchema(syncLogs);

export type InsertTransformationLog = typeof transformationLogs.$inferInsert;
export type SelectTransformationLog = typeof transformationLogs.$inferSelect;
export type InsertSyncLog = typeof syncLogs.$inferInsert;
export type SelectSyncLog = typeof syncLogs.$inferSelect;