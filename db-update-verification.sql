-- Add email verification fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP,
ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0;

-- Update existing users to be verified by default for backward compatibility
UPDATE users SET verified = TRUE WHERE verified IS NULL;

-- Create verification_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS verification_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  telegram_id TEXT NOT NULL,
  telegram_username TEXT NOT NULL,
  goated_username TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_by TEXT,
  verified_at TIMESTAMP,
  requested_at TIMESTAMP DEFAULT NOW(),
  admin_notes TEXT
);