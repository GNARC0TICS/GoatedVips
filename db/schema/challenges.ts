import { pgTable, text, timestamp, boolean, serial, integer } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { users } from "./users";
import { bonusCodes, type BonusCode as ImportedBonusCodeType } from "./bonus";

export const challenges = pgTable('challenges', {
  id: serial('id').primaryKey(),
  game: text('game').notNull(),
  minBet: text('min_bet').notNull(),
  multiplier: text('multiplier'),
  prizeAmount: text('prize_amount').notNull(),
  maxWinners: integer('max_winners').notNull(),
  timeframe: timestamp('timeframe', { withTimezone: true }).notNull(),
  description: text('description'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdBy: integer('created_by').references(() => users.id),
  bonusCode: text('bonus_code'),
  source: text('source').default('web'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const challengeEntries = pgTable('challenge_entries', {
  id: serial('id').primaryKey(),
  challengeId: integer('challenge_id').notNull().references(() => challenges.id),
  userId: integer('user_id').notNull().references(() => users.id),
  betLink: text('bet_link').notNull(),
  status: text('status').default('pending'),
  bonusCode: text('bonus_code'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedBy: integer('verified_by').references(() => users.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Define relations
export const challengeRelations = relations(challenges, ({ many, one }) => ({
  entries: many(challengeEntries),
  creator: one(users, {
    fields: [challenges.createdBy],
    references: [users.id],
  })
}));

export const challengeEntriesRelations = relations(challengeEntries, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeEntries.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeEntries.userId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [challengeEntries.verifiedBy],
    references: [users.id],
  })
}));

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;
export type ChallengeEntry = typeof challengeEntries.$inferSelect;
export type InsertChallengeEntry = typeof challengeEntries.$inferInsert;
export type BonusCode = ImportedBonusCodeType;