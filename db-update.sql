-- Add new columns to users table for Goated.com integration
ALTER TABLE users
ADD COLUMN IF NOT EXISTS uid TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS total_wager DECIMAL(18, 8) DEFAULT '0' NOT NULL,
ADD COLUMN IF NOT EXISTS wager_today DECIMAL(18, 8) DEFAULT '0' NOT NULL,
ADD COLUMN IF NOT EXISTS wager_week DECIMAL(18, 8) DEFAULT '0' NOT NULL,
ADD COLUMN IF NOT EXISTS wager_month DECIMAL(18, 8) DEFAULT '0' NOT NULL,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE NOT NULL;

-- Update existing goated_id values to also populate the uid column for backward compatibility
UPDATE users SET uid = goated_id WHERE goated_id IS NOT NULL AND uid IS NULL;