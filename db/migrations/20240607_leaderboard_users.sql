CREATE TABLE IF NOT EXISTS leaderboard_users (
  id SERIAL PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  wager_today BIGINT DEFAULT 0,
  wager_week BIGINT DEFAULT 0,
  wager_month BIGINT DEFAULT 0,
  wager_all_time BIGINT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
); 