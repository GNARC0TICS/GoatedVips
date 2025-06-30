import { pgTable, text, varchar, boolean, decimal, integer, uuid, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table - Updated to match current database structure
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  
  role: varchar('role', { length: 20 }).notNull().default('user'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatar: text('avatar'),
  profileColor: varchar('profile_color', { length: 7 }).default('#D7FF00'),
  
  goatedId: varchar('goated_id', { length: 50 }).unique(),
  goatedUsername: varchar('goated_username', { length: 100 }),
  goatedLinked: boolean('goated_linked').default(false),
  goatedVerified: boolean('goated_verified').default(false),
  
  privacySettings: jsonb('privacy_settings').default(sql`'{"profilePublic": true, "showStats": true, "showRankings": true}'::jsonb`),
  preferences: jsonb('preferences').default(sql`'{"emailNotifications": true, "pushNotifications": false, "theme": "dark", "language": "en"}'::jsonb`),
  
  emailVerified: boolean('email_verified').default(false),
  emailVerificationToken: text('email_verification_token'),
  emailVerificationSentAt: timestamp('email_verification_sent_at'),
  
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: text('two_factor_secret'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  lastPasswordChange: timestamp('last_password_change'),
  
  lastLoginAt: timestamp('last_login_at'),
  lastActiveAt: timestamp('last_active_at'),
  loginCount: integer('login_count').default(0),
  
  createdAt: timestamp('created_at').default(sql`NOW()`),
  updatedAt: timestamp('updated_at').default(sql`NOW()`),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  usernameIdx: index('idx_users_username').on(table.username),
  goatedIdIdx: index('idx_users_goated_id').on(table.goatedId),
  statusRoleIdx: index('idx_users_status_role').on(table.status, table.role),
  createdAtIdx: index('idx_users_created_at').on(table.createdAt),
  lastActiveIdx: index('idx_users_last_active').on(table.lastActiveAt),
}));

// User sessions table
export const userSessions = pgTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  data: jsonb('data'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').default(sql`NOW()`),
  lastAccessedAt: timestamp('last_accessed_at').default(sql`NOW()`),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
}, (table) => ({
  userIdIdx: index('idx_sessions_user_id').on(table.userId),
  expiresAtIdx: index('idx_sessions_expires_at').on(table.expiresAt),
}));

// Wager stats table - matches current database structure
export const wagerStats = pgTable('wager_stats', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  goatedId: varchar('goated_id', { length: 50 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull(),
  
  dailyWager: decimal('daily_wager', { precision: 15, scale: 2 }).default('0'),
  weeklyWager: decimal('weekly_wager', { precision: 15, scale: 2 }).default('0'),
  monthlyWager: decimal('monthly_wager', { precision: 15, scale: 2 }).default('0'),
  allTimeWager: decimal('all_time_wager', { precision: 15, scale: 2 }).default('0'),
  
  dailyRank: integer('daily_rank'),
  weeklyRank: integer('weekly_rank'),
  monthlyRank: integer('monthly_rank'),
  allTimeRank: integer('all_time_rank'),
  
  lastSyncAt: timestamp('last_sync_at').default(sql`NOW()`),
  syncSource: varchar('sync_source', { length: 20 }).default('api'),
  
  createdAt: timestamp('created_at').default(sql`NOW()`),
  updatedAt: timestamp('updated_at').default(sql`NOW()`),
}, (table) => ({
  dailyRankIdx: index('idx_wager_stats_daily_rank').on(table.dailyRank),
  weeklyRankIdx: index('idx_wager_stats_weekly_rank').on(table.weeklyRank),
  monthlyRankIdx: index('idx_wager_stats_monthly_rank').on(table.monthlyRank),
  allTimeRankIdx: index('idx_wager_stats_all_time_rank').on(table.allTimeRank),
  dailyWagerIdx: index('idx_wager_stats_daily_wager').on(table.dailyWager),
  weeklyWagerIdx: index('idx_wager_stats_weekly_wager').on(table.weeklyWager),
  monthlyWagerIdx: index('idx_wager_stats_monthly_wager').on(table.monthlyWager),
  allTimeWagerIdx: index('idx_wager_stats_all_time_wager').on(table.allTimeWager),
  goatedIdIdx: index('idx_wager_stats_goated_id').on(table.goatedId),
  lastSyncIdx: index('idx_wager_stats_last_sync').on(table.lastSyncAt),
}));

// Legacy table exports for compatibility with existing code
export const leaderboardUsers = pgTable('leaderboard_users', {
  id: integer('id').primaryKey(),
  username: text('username').notNull(),
  goatedId: text('goated_id'),
  dailyWager: text('daily_wager'),
  weeklyWager: text('weekly_wager'),
  monthlyWager: text('monthly_wager'),
  totalWager: text('total_wager'),
  dailyRank: integer('daily_rank'),
  weeklyRank: integer('weekly_rank'),
  monthlyRank: integer('monthly_rank'),
  allTimeRank: integer('all_time_rank'),
  lastUpdated: timestamp('last_updated'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const wagerRaces = pgTable('wager_races', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  status: text('status').default('upcoming'),
  prizePool: decimal('prize_pool', { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  minWager: decimal('min_wager', { precision: 10, scale: 2 }).default('0'),
  prizeDistribution: jsonb('prize_distribution').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
  rules: text('rules'),
  description: text('description'),
  completedAt: timestamp('completed_at'),
  name: text('name'),
});

export const bonusCodes = pgTable('bonus_codes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description'),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  type: text('type').notNull(),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
  createdBy: text('created_by'),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  data: jsonb('data'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Wager entries table for tracking individual wager transactions
export const wagerEntries = pgTable('wager_entries', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goatedId: varchar('goated_id', { length: 50 }).notNull(),
  
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  game: varchar('game', { length: 100 }),
  
  wagerTimestamp: timestamp('wager_timestamp').notNull(),
  syncedAt: timestamp('synced_at').default(sql`NOW()`),
  
  source: varchar('source', { length: 20 }).default('api'),
  verified: boolean('verified').default(false),
  
  createdAt: timestamp('created_at').default(sql`NOW()`),
}, (table) => ({
  userIdIdx: index('idx_wager_entries_user_id').on(table.userId),
  goatedIdIdx: index('idx_wager_entries_goated_id').on(table.goatedId),
  timestampIdx: index('idx_wager_entries_timestamp').on(table.wagerTimestamp),
  amountIdx: index('idx_wager_entries_amount').on(table.amount),
  syncedAtIdx: index('idx_wager_entries_synced_at').on(table.syncedAt),
}));

// Wager adjustments table for manual admin modifications
export const wagerAdjustments = pgTable('wager_adjustments', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goatedId: varchar('goated_id', { length: 50 }).notNull(),
  adminId: uuid('admin_id').notNull().references(() => users.id),
  
  dailyAdjustment: decimal('daily_adjustment', { precision: 15, scale: 2 }).default('0'),
  weeklyAdjustment: decimal('weekly_adjustment', { precision: 15, scale: 2 }).default('0'),
  monthlyAdjustment: decimal('monthly_adjustment', { precision: 15, scale: 2 }).default('0'),
  allTimeAdjustment: decimal('all_time_adjustment', { precision: 15, scale: 2 }).default('0'),
  
  reason: text('reason').notNull(),
  adjustmentType: varchar('adjustment_type', { length: 20 }).notNull(),
  originalValue: decimal('original_value', { precision: 15, scale: 2 }),
  newValue: decimal('new_value', { precision: 15, scale: 2 }),
  
  appliedToTimeframe: varchar('applied_to_timeframe', { length: 20 }).notNull(),
  
  status: varchar('status', { length: 20 }).default('active'),
  isActive: boolean('is_active').default(true),
  
  adminNotes: text('admin_notes'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  createdAt: timestamp('created_at').default(sql`NOW()`),
  revertedAt: timestamp('reverted_at'),
  revertedBy: uuid('reverted_by').references(() => users.id),
}, (table) => ({
  userIdIdx: index('idx_wager_adjustments_user_id').on(table.userId),
  goatedIdIdx: index('idx_wager_adjustments_goated_id').on(table.goatedId),
  adminIdIdx: index('idx_wager_adjustments_admin_id').on(table.adminId),
  timeframeIdx: index('idx_wager_adjustments_timeframe').on(table.appliedToTimeframe),
  statusIdx: index('idx_wager_adjustments_status').on(table.status, table.isActive),
  createdAtIdx: index('idx_wager_adjustments_created_at').on(table.createdAt),
}));

// Computed wager view table for fast querying of final wager amounts
export const computedWagerStats = pgTable('computed_wager_stats', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  goatedId: varchar('goated_id', { length: 50 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull(),
  
  rawDailyWager: decimal('raw_daily_wager', { precision: 15, scale: 2 }).default('0'),
  rawWeeklyWager: decimal('raw_weekly_wager', { precision: 15, scale: 2 }).default('0'),
  rawMonthlyWager: decimal('raw_monthly_wager', { precision: 15, scale: 2 }).default('0'),
  rawAllTimeWager: decimal('raw_all_time_wager', { precision: 15, scale: 2 }).default('0'),
  
  totalDailyAdjustment: decimal('total_daily_adjustment', { precision: 15, scale: 2 }).default('0'),
  totalWeeklyAdjustment: decimal('total_weekly_adjustment', { precision: 15, scale: 2 }).default('0'),
  totalMonthlyAdjustment: decimal('total_monthly_adjustment', { precision: 15, scale: 2 }).default('0'),
  totalAllTimeAdjustment: decimal('total_all_time_adjustment', { precision: 15, scale: 2 }).default('0'),
  
  finalDailyWager: decimal('final_daily_wager', { precision: 15, scale: 2 }).default('0'),
  finalWeeklyWager: decimal('final_weekly_wager', { precision: 15, scale: 2 }).default('0'),
  finalMonthlyWager: decimal('final_monthly_wager', { precision: 15, scale: 2 }).default('0'),
  finalAllTimeWager: decimal('final_all_time_wager', { precision: 15, scale: 2 }).default('0'),
  
  dailyRank: integer('daily_rank'),
  weeklyRank: integer('weekly_rank'),
  monthlyRank: integer('monthly_rank'),
  allTimeRank: integer('all_time_rank'),
  
  hasAdjustments: boolean('has_adjustments').default(false),
  adjustmentCount: integer('adjustment_count').default(0),
  lastApiSync: timestamp('last_api_sync'),
  lastAdjustment: timestamp('last_adjustment'),
  
  updatedAt: timestamp('updated_at').default(sql`NOW()`),
  computedAt: timestamp('computed_at').default(sql`NOW()`),
}, (table) => ({
  goatedIdIdx: index('idx_computed_wager_goated_id').on(table.goatedId),
  dailyRankIdx: index('idx_computed_wager_daily_rank').on(table.dailyRank),
  weeklyRankIdx: index('idx_computed_wager_weekly_rank').on(table.weeklyRank),
  monthlyRankIdx: index('idx_computed_wager_monthly_rank').on(table.monthlyRank),
  allTimeRankIdx: index('idx_computed_wager_all_time_rank').on(table.allTimeRank),
  finalDailyIdx: index('idx_computed_wager_final_daily').on(table.finalDailyWager),
  finalWeeklyIdx: index('idx_computed_wager_final_weekly').on(table.finalWeeklyWager),
  finalMonthlyIdx: index('idx_computed_wager_final_monthly').on(table.finalMonthlyWager),
  finalAllTimeIdx: index('idx_computed_wager_final_all_time').on(table.finalAllTimeWager),
  hasAdjustmentsIdx: index('idx_computed_wager_has_adjustments').on(table.hasAdjustments),
  lastSyncIdx: index('idx_computed_wager_last_sync').on(table.lastApiSync),
}));

// Goated linking requests table
export const goatedLinkingRequests = pgTable('goated_linking_requests', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  goatedId: varchar('goated_id', { length: 50 }).notNull(),
  goatedUsername: varchar('goated_username', { length: 100 }).notNull(),
  
  status: varchar('status', { length: 20 }).default('pending'),
  verificationCode: varchar('verification_code', { length: 10 }).notNull(),
  verificationMethod: varchar('verification_method', { length: 20 }).default('telegram'),
  
  requestedAt: timestamp('requested_at').default(sql`NOW()`),
  verifiedAt: timestamp('verified_at'),
  linkedAt: timestamp('linked_at'),
  expiresAt: timestamp('expires_at').notNull(),
  
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  adminApprovedBy: uuid('admin_approved_by').references(() => users.id),
  adminNotes: text('admin_notes'),
  
  createdAt: timestamp('created_at').default(sql`NOW()`),
  updatedAt: timestamp('updated_at').default(sql`NOW()`),
}, (table) => ({
  userIdIdx: index('idx_goated_linking_user_id').on(table.userId),
  goatedIdIdx: index('idx_goated_linking_goated_id').on(table.goatedId),
  statusIdx: index('idx_goated_linking_status').on(table.status),
  verificationCodeIdx: index('idx_goated_linking_verification_code').on(table.verificationCode),
  expiresAtIdx: index('idx_goated_linking_expires_at').on(table.expiresAt),
}));

// Linking verification log table
export const linkingVerificationLog = pgTable('linking_verification_log', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  requestId: uuid('request_id').notNull().references(() => goatedLinkingRequests.id, { onDelete: 'cascade' }),
  
  verificationAttempt: integer('verification_attempt').notNull(),
  verificationMethod: varchar('verification_method', { length: 20 }).notNull(),
  verificationData: jsonb('verification_data'),
  
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  createdAt: timestamp('created_at').default(sql`NOW()`),
}, (table) => ({
  requestIdIdx: index('idx_verification_log_request_id').on(table.requestId),
  successIdx: index('idx_verification_log_success').on(table.success),
  createdAtIdx: index('idx_verification_log_created_at').on(table.createdAt),
}));

// Goated linking history table
export const goatedLinkingHistory = pgTable('goated_linking_history', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  previousGoatedId: varchar('previous_goated_id', { length: 50 }),
  previousGoatedUsername: varchar('previous_goated_username', { length: 100 }),
  
  newGoatedId: varchar('new_goated_id', { length: 50 }),
  newGoatedUsername: varchar('new_goated_username', { length: 100 }),
  
  actionType: varchar('action_type', { length: 20 }).notNull(), // 'link', 'unlink', 'relink'
  reason: text('reason'),
  
  performedBy: uuid('performed_by').references(() => users.id),
  performedByRole: varchar('performed_by_role', { length: 20 }),
  
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  createdAt: timestamp('created_at').default(sql`NOW()`),
}, (table) => ({
  userIdIdx: index('idx_linking_history_user_id').on(table.userId),
  actionTypeIdx: index('idx_linking_history_action_type').on(table.actionType),
  performedByIdx: index('idx_linking_history_performed_by').on(table.performedBy),
  createdAtIdx: index('idx_linking_history_created_at').on(table.createdAt),
}));