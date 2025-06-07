import { pgTable, serial, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const raceSnapshots = pgTable('race_snapshots', {
  id: serial('id').primaryKey(),
  snapshotTakenAt: timestamp('snapshot_taken_at', { withTimezone: true }).defaultNow(),
  originalRaceEndDate: timestamp('original_race_end_date', { withTimezone: true }).notNull(), // For querying/sorting by date
  raceType: text('race_type').notNull(), // e.g., 'monthly', 'weekly'
  raceName: text('race_name').notNull(), // e.g., "Monthly Goated Race - July 2025"

  // Stores the equivalent of the RaceConfig object at the time the race ended
  raceConfigData: jsonb('race_config_data').notNull(),

  // Stores the array of leaderboard entries (top N players) for that specific race
  // Each entry: { uid, userId, username, wagered, rank, avatarUrl, won, profit, prizeWon }
  leaderboardEntriesData: jsonb('leaderboard_entries_data').notNull(),
});

export type InsertRaceSnapshot = typeof raceSnapshots.$inferInsert;
export type SelectRaceSnapshot = typeof raceSnapshots.$inferSelect; 