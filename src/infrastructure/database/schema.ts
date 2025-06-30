import { pgTable, text, varchar, boolean, decimal, integer, uuid, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  username: varchar('username', { length: 30 }).notNull().unique(),
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
  
  privacySettings: jsonb('privacy_settings').default({
    profilePublic: true,
    showStats: true,
    showRankings: true
  }),
  preferences: jsonb('preferences').default({
    emailNotifications: true,
    pushNotifications: false,
    theme: 'dark',
    language: 'en'
  }),
  
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

// Wager stats table
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

// Wager entries table
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

// Races table
export const races = pgTable('races', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).default('upcoming'),
  
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  
  minWagerAmount: decimal('min_wager_amount', { precision: 15, scale: 2 }).default('0'),
  maxParticipants: integer('max_participants'),
  
  totalPrizePool: decimal('total_prize_pool', { precision: 15, scale: 2 }).notNull(),
  prizeDistribution: jsonb('prize_distribution').notNull(),
  
  participantCount: integer('participant_count').default(0),
  totalWagered: decimal('total_wagered', { precision: 15, scale: 2 }).default('0'),
  
  createdAt: timestamp('created_at').default(sql`NOW()`),
  updatedAt: timestamp('updated_at').default(sql`NOW()`),
}, (table) => ({
  statusIdx: index('idx_races_status').on(table.status),
  typeIdx: index('idx_races_type').on(table.type),
  startTimeIdx: index('idx_races_start_time').on(table.startTime),
  endTimeIdx: index('idx_races_end_time').on(table.endTime),
}));

// Race participants table
export const raceParticipants = pgTable('race_participants', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  raceId: uuid('race_id').notNull().references(() => races.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goatedId: varchar('goated_id', { length: 50 }).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  
  totalWager: decimal('total_wager', { precision: 15, scale: 2 }).default('0'),
  position: integer('position'),
  prizeWon: decimal('prize_won', { precision: 15, scale: 2 }).default('0'),
  
  joined: boolean('joined').default(true),
  qualified: boolean('qualified').default(false),
  disqualified: boolean('disqualified').default(false),
  disqualificationReason: text('disqualification_reason'),
  
  joinedAt: timestamp('joined_at').default(sql`NOW()`),
  lastWagerAt: timestamp('last_wager_at'),
}, (table) => ({
  raceIdIdx: index('idx_race_participants_race_id').on(table.raceId),
  userIdIdx: index('idx_race_participants_user_id').on(table.userId),
  positionIdx: index('idx_race_participants_position').on(table.raceId, table.position),
  totalWagerIdx: index('idx_race_participants_total_wager').on(table.raceId, table.totalWager),
}));

// Wager adjustments table - for manual admin modifications
export const wagerAdjustments = pgTable('wager_adjustments', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goatedId: varchar('goated_id', { length: 50 }).notNull(),
  adminId: uuid('admin_id').notNull().references(() => users.id),
  
  // Adjustment amounts for each timeframe
  dailyAdjustment: decimal('daily_adjustment', { precision: 15, scale: 2 }).default('0'),
  weeklyAdjustment: decimal('weekly_adjustment', { precision: 15, scale: 2 }).default('0'),
  monthlyAdjustment: decimal('monthly_adjustment', { precision: 15, scale: 2 }).default('0'),
  allTimeAdjustment: decimal('all_time_adjustment', { precision: 15, scale: 2 }).default('0'),
  
  // Adjustment metadata
  reason: text('reason').notNull(),
  adjustmentType: varchar('adjustment_type', { length: 20 }).notNull(), // 'add', 'subtract', 'set'
  originalValue: decimal('original_value', { precision: 15, scale: 2 }), // Value before adjustment
  newValue: decimal('new_value', { precision: 15, scale: 2 }), // Value after adjustment
  
  // Applied scope
  appliedToTimeframe: varchar('applied_to_timeframe', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly', 'all_time'
  
  // Status tracking
  status: varchar('status', { length: 20 }).default('active'), // 'active', 'reverted'
  isActive: boolean('is_active').default(true),
  
  // Audit trail
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

// Wager sync log table - for tracking API synchronization
export const wagerSyncLog = pgTable('wager_sync_log', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  
  // Sync metadata
  syncType: varchar('sync_type', { length: 20 }).notNull(), // 'full', 'incremental', 'user_specific'
  timeframe: varchar('timeframe', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly', 'all_time'
  
  // Results
  usersProcessed: integer('users_processed').default(0),
  usersUpdated: integer('users_updated').default(0),
  usersAdded: integer('users_added').default(0),
  errors: integer('errors').default(0),
  
  // External API info
  apiResponseTime: integer('api_response_time'), // in milliseconds
  apiStatus: varchar('api_status', { length: 20 }), // 'success', 'failure', 'partial'
  
  // Sync timing
  startedAt: timestamp('started_at').default(sql`NOW()`),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // in seconds
  
  // Error tracking
  errorDetails: jsonb('error_details'),
  
  createdAt: timestamp('created_at').default(sql`NOW()`),
}, (table) => ({
  syncTypeIdx: index('idx_wager_sync_log_sync_type').on(table.syncType),
  timeframeIdx: index('idx_wager_sync_log_timeframe').on(table.timeframe),
  statusIdx: index('idx_wager_sync_log_status').on(table.apiStatus),
  startedAtIdx: index('idx_wager_sync_log_started_at').on(table.startedAt),
}));

// Computed wager view table - for fast querying of final wager amounts
export const computedWagerStats = pgTable('computed_wager_stats', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  goatedId: varchar('goated_id', { length: 50 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull(),
  
  // Raw amounts from API
  rawDailyWager: decimal('raw_daily_wager', { precision: 15, scale: 2 }).default('0'),
  rawWeeklyWager: decimal('raw_weekly_wager', { precision: 15, scale: 2 }).default('0'),
  rawMonthlyWager: decimal('raw_monthly_wager', { precision: 15, scale: 2 }).default('0'),
  rawAllTimeWager: decimal('raw_all_time_wager', { precision: 15, scale: 2 }).default('0'),
  
  // Total adjustments applied
  totalDailyAdjustment: decimal('total_daily_adjustment', { precision: 15, scale: 2 }).default('0'),
  totalWeeklyAdjustment: decimal('total_weekly_adjustment', { precision: 15, scale: 2 }).default('0'),
  totalMonthlyAdjustment: decimal('total_monthly_adjustment', { precision: 15, scale: 2 }).default('0'),
  totalAllTimeAdjustment: decimal('total_all_time_adjustment', { precision: 15, scale: 2 }).default('0'),
  
  // Final computed amounts (raw + adjustments)
  finalDailyWager: decimal('final_daily_wager', { precision: 15, scale: 2 }).default('0'),
  finalWeeklyWager: decimal('final_weekly_wager', { precision: 15, scale: 2 }).default('0'),
  finalMonthlyWager: decimal('final_monthly_wager', { precision: 15, scale: 2 }).default('0'),
  finalAllTimeWager: decimal('final_all_time_wager', { precision: 15, scale: 2 }).default('0'),
  
  // Rankings based on final amounts
  dailyRank: integer('daily_rank'),
  weeklyRank: integer('weekly_rank'),
  monthlyRank: integer('monthly_rank'),
  allTimeRank: integer('all_time_rank'),
  
  // Tracking
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

// Goated account linking requests table
export const goatedLinkingRequests = pgTable('goated_linking_requests', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // User's claim information
  claimedGoatedId: varchar('claimed_goated_id', { length: 50 }).notNull(),
  claimedGoatedUsername: varchar('claimed_goated_username', { length: 100 }).notNull(),
  
  // Verification information provided by user
  verificationMethod: varchar('verification_method', { length: 50 }).notNull(), // 'email', 'transaction', 'support_ticket', 'other'
  verificationData: text('verification_data'), // Email, transaction ID, ticket number, etc.
  userMessage: text('user_message'), // User's explanation/proof
  
  // Request status
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'approved', 'rejected', 'under_review'
  
  // Admin review
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  adminNotes: text('admin_notes'),
  rejectionReason: text('rejection_reason'),
  
  // Verification details
  externalDataVerified: boolean('external_data_verified').default(false),
  wagerDataMatches: boolean('wager_data_matches').default(false),
  identityVerified: boolean('identity_verified').default(false),
  
  // Request metadata
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  requestSource: varchar('request_source', { length: 50 }).default('web'), // 'web', 'mobile', 'api'
  
  createdAt: timestamp('created_at').default(sql`NOW()`),
  updatedAt: timestamp('updated_at').default(sql`NOW()`),
}, (table) => ({
  userIdIdx: index('idx_linking_requests_user_id').on(table.userId),
  claimedGoatedIdIdx: index('idx_linking_requests_claimed_goated_id').on(table.claimedGoatedId),
  statusIdx: index('idx_linking_requests_status').on(table.status),
  reviewedByIdx: index('idx_linking_requests_reviewed_by').on(table.reviewedBy),
  createdAtIdx: index('idx_linking_requests_created_at').on(table.createdAt),
  verificationMethodIdx: index('idx_linking_requests_verification_method').on(table.verificationMethod),
}));

// Linking verification log table - for tracking verification attempts
export const linkingVerificationLog = pgTable('linking_verification_log', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  linkingRequestId: uuid('linking_request_id').notNull().references(() => goatedLinkingRequests.id, { onDelete: 'cascade' }),
  
  // Verification attempt details
  verificationType: varchar('verification_type', { length: 50 }).notNull(), // 'email_check', 'wager_verification', 'manual_review'
  verificationResult: varchar('verification_result', { length: 20 }).notNull(), // 'success', 'failed', 'partial'
  
  // Details of the verification
  verificationData: jsonb('verification_data'), // Structured data about the verification
  errorMessage: text('error_message'),
  
  // Who performed the verification
  performedBy: uuid('performed_by').references(() => users.id), // Admin ID, null for automated
  performedByType: varchar('performed_by_type', { length: 20 }).default('admin'), // 'admin', 'system', 'external_api'
  
  createdAt: timestamp('created_at').default(sql`NOW()`),
}, (table) => ({
  linkingRequestIdIdx: index('idx_verification_log_linking_request').on(table.linkingRequestId),
  verificationTypeIdx: index('idx_verification_log_type').on(table.verificationType),
  resultIdx: index('idx_verification_log_result').on(table.verificationResult),
  performedByIdx: index('idx_verification_log_performed_by').on(table.performedBy),
  createdAtIdx: index('idx_verification_log_created_at').on(table.createdAt),
}));

// Successfully linked accounts history table
export const goatedLinkingHistory = pgTable('goated_linking_history', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Linking details
  goatedId: varchar('goated_id', { length: 50 }).notNull(),
  goatedUsername: varchar('goated_username', { length: 100 }).notNull(),
  
  // Linking metadata
  linkedBy: uuid('linked_by').notNull().references(() => users.id), // Admin who approved
  linkingRequestId: uuid('linking_request_id').references(() => goatedLinkingRequests.id),
  
  // Status tracking
  status: varchar('status', { length: 20 }).default('active'), // 'active', 'unlinked', 'transferred'
  unlinkReason: text('unlink_reason'),
  unlinkedBy: uuid('unlinked_by').references(() => users.id),
  unlinkedAt: timestamp('unlinked_at'),
  
  // Timestamps
  linkedAt: timestamp('linked_at').default(sql`NOW()`),
  createdAt: timestamp('created_at').default(sql`NOW()`),
}, (table) => ({
  userIdIdx: index('idx_linking_history_user_id').on(table.userId),
  goatedIdIdx: index('idx_linking_history_goated_id').on(table.goatedId),
  linkedByIdx: index('idx_linking_history_linked_by').on(table.linkedBy),
  statusIdx: index('idx_linking_history_status').on(table.status),
  linkedAtIdx: index('idx_linking_history_linked_at').on(table.linkedAt),
}));