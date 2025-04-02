/**
 * Supabase Users Schema
 * 
 * This schema file defines the users table structure for Supabase.
 * It uses UUIDs for primary keys as recommended by Supabase and includes
 * all fields necessary for Goated account integration.
 */

import { pgTable, text, timestamp, uuid, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// User source types
export enum UserSourceType {
  DIRECT_REGISTRATION = 'direct',
  GOATED_API = 'goated_api',
  TEMPORARY = 'temporary'
}

// User account linking status
export enum UserLinkStatus {
  NOT_LINKED = 'not_linked',
  PENDING_VERIFICATION = 'pending',
  VERIFIED = 'verified'
}

// Helper type for self-referencing ID
type UsersTableSelfReference = {
  id: ReturnType<typeof uuid>;
};

// Users table definition
export const users = pgTable('users', {
  // Primary key using UUID (Supabase standard)
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Basic user information
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // Will be 'SUPABASE_AUTH' when using Supabase Auth
  
  // Profile information
  bio: text('bio'),
  profileColor: text('profile_color').default('#D7FF00'),
  profileImage: text('profile_image'),
  
  // Goated.com integration
  goatedId: text('goated_id').unique(),
  goatedUsername: text('goated_username'),
  goatedAccountLinked: boolean('goated_account_linked').default(false),
  
  // New fields for improved user management
  sourceType: text('source_type').default(UserSourceType.DIRECT_REGISTRATION).notNull(),
  linkStatus: text('link_status').default(UserLinkStatus.NOT_LINKED).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  mergedTo: uuid('merged_to'), // Will be set up as foreign key after table creation
  
  // Verification fields
  emailVerified: boolean('email_verified').default(false),
  emailVerificationToken: text('email_verification_token'),
  verificationToken: text('verification_token'),
  verificationTokenExpiresAt: timestamp('verification_token_expires_at'),
  
  // Security fields
  lastLogin: timestamp('last_login'),
  lastActive: timestamp('last_active'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  accountLocked: boolean('account_locked').default(false),
  lockoutUntil: timestamp('lockout_until'),
  
  // Admin status
  isAdmin: boolean('is_admin').default(false).notNull(),
  
  // Telegram integration
  telegramId: text('telegram_id').unique(),
  telegramUsername: text('telegram_username'),
  
  // Timestamps
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
  
  // Preferences and customization (as JSON)
  preferences: jsonb('preferences').default({
    emailNotifications: true,
    telegramNotifications: true,
    marketingEmails: false,
  }).notNull(),
  customization: jsonb('customization').default({}).notNull(),
  
  // Supabase Auth integration
  supabaseUserId: uuid('supabase_user_id').unique(),
});

// Export the schema
export default { users };
