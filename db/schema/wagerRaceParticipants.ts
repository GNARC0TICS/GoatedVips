import { index, pgTable, integer, text, numeric, jsonb, timestamp, serial, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { wagerRaces } from "./wagerRaces";
import { sql } from "drizzle-orm";

export const wagerRaceParticipants = pgTable("wager_race_participants", {
  id: serial("id").primaryKey(),
  raceId: integer("race_id").references(() => wagerRaces.id),
  userId: integer("user_id").references(() => users.id),
  username: text("username").notNull(),
  wagered: numeric("wagered", { precision: 18, scale: 2 }).notNull(),
  position: integer("position").notNull(),
  prizeAmount: numeric("prize_amount", { precision: 18, scale: 2 }).default("0"),
  prizeClaimed: boolean("prize_claimed").default(false).notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).default(sql.raw('CURRENT_TIMESTAMP')).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql.raw('CURRENT_TIMESTAMP')).notNull(),
  wagerHistory: jsonb("wager_history"),
  previousPosition: integer("previous_position"),
}, (table) => ({
  raceIdx: index("idx_race_id").on(table.raceId),
  userIdx: index("wager_race_participants_user_id_idx").on(table.userId),
  posIdx: index("idx_position").on(table.position),
}));

export const wagerRaceParticipantRelations = relations(wagerRaceParticipants, ({ one }) => ({
  race: one(wagerRaces, {
    fields: [wagerRaceParticipants.raceId],
    references: [wagerRaces.id],
  }),
  user: one(users, {
    fields: [wagerRaceParticipants.userId],
    references: [users.id],
  }),
}));

export type InsertWagerRaceParticipant = typeof wagerRaceParticipants.$inferInsert;
export type SelectWagerRaceParticipant = typeof wagerRaceParticipants.$inferSelect; 