import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

/**
 * Verification Requests Table
 * 
 * This table stores verification requests for linking Goated.com accounts
 * with the platform's user accounts.
 */
export const verificationRequests = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  telegramId: text("telegram_id").notNull(),
  telegramUsername: text("telegram_username").notNull(),
  goatedUsername: text("goated_username").notNull(),
  status: text("status").notNull().default("pending"),
  verifiedBy: text("verified_by"),
  verifiedAt: timestamp("verified_at", { mode: "date" }),
  requestedAt: timestamp("requested_at", { mode: "date" }).defaultNow(),
  adminNotes: text("admin_notes")
});

/**
 * Relations for verification requests
 */
export const verificationRequestRelations = relations(verificationRequests, ({ one }) => ({
  user: one(users, {
    fields: [verificationRequests.userId],
    references: [users.id]
  })
}));

/**
 * Verification Request Schemas
 * 
 * Zod schemas for insertion and selection from verification_requests table
 */
export const insertVerificationRequestSchema = createInsertSchema(verificationRequests);
export const selectVerificationRequestSchema = createSelectSchema(verificationRequests);

export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type SelectVerificationRequest = z.infer<typeof selectVerificationRequestSchema>;

/**
 * Email Verification Fields
 * 
 * These fields are added to the users table schema to support
 * email verification functionality.
 */
export const emailVerificationFields = {
  // Verification token for email confirmation
  emailVerificationToken: text("email_verification_token"),
  // When the verification token expires
  emailVerificationExpires: timestamp("email_verification_expires", { mode: "date" }),
  // If the email has been verified (using the same field name as in users schema)
  emailVerified: boolean("email_verified").default(false),
  // Password reset token
  passwordResetToken: text("password_reset_token"),
  // When the password reset token expires
  passwordResetExpires: timestamp("password_reset_expires", { mode: "date" }),
  // Token version for invalidating JWT tokens
  tokenVersion: integer("token_version").default(0)
};

/**
 * Update schema function
 * 
 * Helper function to update an existing table schema with email verification fields
 * @param tableName The table name to create the schema update for
 * @returns SQL statement to execute for adding verification fields
 */
export function createVerificationFieldsSQL(tableName: string): string {
  return `
    ALTER TABLE ${tableName} 
    ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
    ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP,
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
    ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP,
    ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0
  `;
}