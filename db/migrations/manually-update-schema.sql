-- Manually update the schema

-- Add columns to wagerRaces
ALTER TABLE wager_races
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS name TEXT;

-- Set default values for certain columns
ALTER TABLE wager_races
ALTER COLUMN min_wager SET DEFAULT '0',
ALTER COLUMN prize_distribution SET DEFAULT '{}';

-- Add columns to wagerRaceParticipants if they don't exist
ALTER TABLE wager_race_participants
ADD COLUMN IF NOT EXISTS username TEXT;

CREATE TABLE IF NOT EXISTS goated_wager_leaderboard (
  uid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  wagered_today NUMERIC(18,8) NOT NULL DEFAULT 0,
  wagered_this_week NUMERIC(18,8) NOT NULL DEFAULT 0,
  wagered_this_month NUMERIC(18,8) NOT NULL DEFAULT 0,
  wagered_all_time NUMERIC(18,8) NOT NULL DEFAULT 0,
  last_synced TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);