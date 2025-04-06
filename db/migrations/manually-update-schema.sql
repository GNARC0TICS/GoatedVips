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