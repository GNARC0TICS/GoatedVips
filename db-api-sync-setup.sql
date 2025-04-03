-- Create the api_sync_metadata table for tracking API responses
CREATE TABLE IF NOT EXISTS api_sync_metadata (
  id SERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL,
  last_sync_time TIMESTAMP NOT NULL DEFAULT NOW(),
  record_count INTEGER NOT NULL DEFAULT 0,
  etag TEXT,
  last_modified TEXT,
  response_hash TEXT,
  is_full_sync BOOLEAN NOT NULL DEFAULT TRUE,
  sync_duration_ms INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'
);