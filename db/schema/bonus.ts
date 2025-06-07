import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { users } from "./users";

export const bonusCodes = pgTable('bonus_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description'),
  bonusAmount: text('bonus_amount').notNull(),
  requiredWager: text('required_wager'),
  totalClaims: integer('total_claims').notNull(),
  currentClaims: integer('current_claims').default(0),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  status: text('status').default('active'),
  source: text('source').default('web'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const bonusCodeClaims = pgTable('bonus_code_claims', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  bonusCodeId: integer('bonus_code_id').notNull().references(() => bonusCodes.id),
  claimedAt: timestamp('claimed_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  wagerCompleted: boolean('wager_completed').default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const bonusCodeRelations = relations(bonusCodes, ({ one, many }) => ({
  creator: one(users, {
    fields: [bonusCodes.createdBy],
    references: [users.id],
  }),
  claims: many(bonusCodeClaims)
}));

export const bonusCodeClaimRelations = relations(bonusCodeClaims, ({ one }) => ({
  user: one(users, {
    fields: [bonusCodeClaims.userId],
    references: [users.id],
  }),
  bonusCode: one(bonusCodes, {
    fields: [bonusCodeClaims.bonusCodeId],
    references: [bonusCodes.id],
  }),
}));

export type BonusCode = typeof bonusCodes.$inferSelect;
export type InsertBonusCode = typeof bonusCodes.$inferInsert;
export type BonusCodeClaim = typeof bonusCodeClaims.$inferSelect;
export type InsertBonusCodeClaim = typeof bonusCodeClaims.$inferInsert;