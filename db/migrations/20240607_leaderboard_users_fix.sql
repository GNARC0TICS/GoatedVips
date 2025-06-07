-- Fix leaderboard_users table to handle decimal wager amounts
ALTER TABLE leaderboard_users 
  ALTER COLUMN wager_today TYPE DECIMAL(18,8),
  ALTER COLUMN wager_week TYPE DECIMAL(18,8),
  ALTER COLUMN wager_month TYPE DECIMAL(18,8),
  ALTER COLUMN wager_all_time TYPE DECIMAL(18,8); 