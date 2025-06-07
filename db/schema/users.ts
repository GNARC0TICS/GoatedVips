import { pgTable, text, timestamp, integer, boolean, jsonb, index, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  data: text('data'),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull().unique(),
  telegramId: text('telegram_id').unique(),
  isAdmin: boolean('is_admin').notNull().default(false),
  bio: text('bio'),
  profileColor: text('profile_color').default('#D7FF00'),
  profilePublic: boolean('profile_public').default(false),
  showStats: boolean('show_stats').default(false),
  profilePrivacySettings: jsonb('profile_privacy_settings').default('{}').notNull(),

  goatedId: text('goated_id').unique(),
  goatedUsername: text('goated_username'),
  goatedAccountLinked: boolean('goated_account_linked').default(false),
  goatedLinkRequested: boolean('goated_link_requested').default(false),
  goatedUsernameRequested: text('goated_username_requested'),
  goatedLinkRequestedAt: timestamp('goated_link_requested_at', { withTimezone: true }),

  totalWager: text('total_wager'),
  dailyWager: text('daily_wager'),
  weeklyWager: text('weekly_wager'),
  monthlyWager: text('monthly_wager'),
  dailyRank: integer('daily_rank'),
  weeklyRank: integer('weekly_rank'),
  monthlyRank: integer('monthly_rank'),
  allTimeRank: integer('all_time_rank'),

  accountVerified: boolean('account_verified').default(false),
  verifiedBy: text('verified_by'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastActive: timestamp('last_active', { withTimezone: true }),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  lastUpdated: timestamp('last_updated', { withTimezone: true }),
  lastWagerSync: timestamp('last_wager_sync', { withTimezone: true }),

  emailVerificationToken: text('email_verification_token'),
  emailVerificationSentAt: timestamp('email_verification_sent_at', { withTimezone: true }),
  emailVerified: boolean('email_verified').default(false),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),

  customization: jsonb('customization').default('{}').notNull(),
  profileImage: text('profile_image'),
  preferences: jsonb('preferences').default('{"emailNotifications": true, "telegramNotifications": true, "marketingEmails": false}').notNull(),
  lastPasswordChange: timestamp('last_password_change', { withTimezone: true }),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  accountLocked: boolean('account_locked').default(false),
  lockoutUntil: timestamp('lockout_until', { withTimezone: true }),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  suspiciousActivity: boolean('suspicious_activity').default(false),
  activityLogs: jsonb('activity_logs').default('[]').notNull(),
}, (table) => ({
  goatedIdIdx: index("idx_goated_id").on(table.goatedId),
  userIdIdx: index("idx_user_id").on(table.id),
  emailIdx: index("idx_email").on(table.email), 
}));

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
