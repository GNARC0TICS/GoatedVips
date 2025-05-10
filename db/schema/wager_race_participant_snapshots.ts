import { pgTable, serial, integer, text, varchar, decimal, timestamp, index, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { wagerRaces } from './wager_races';

export const wagerRaceParticipantSnapshots = pgTable('wager_race_participant_snapshots', {
  id: serial('id').primaryKey(),
  wagerRaceId: uuid('wager_race_id').references(() => wagerRaces.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }), // Platform user ID, may be null if user unregistered
  goatedId: text('goated_id').notNull(), // Goated.com UID
  usernameAtRaceEnd: varchar('username_at_race_end', { length: 255 }).notNull(),
  finalRank: integer('final_rank').notNull(),
  wageredAmount: decimal('wagered_amount', { precision: 19, scale: 4 }).notNull().default('0.00'),
  prizeWonAmount: decimal('prize_won_amount', { precision: 19, scale: 4 }).default('0.00'),
  snapshotTimestamp: timestamp('snapshot_timestamp', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  raceIdIdx: index('wrps_wager_race_id_idx').on(table.wagerRaceId),
  userIdIdx: index('wrps_user_id_idx').on(table.userId),
  goatedIdIdx: index('wrps_goated_id_idx').on(table.goatedId),
})); 