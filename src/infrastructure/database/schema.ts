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