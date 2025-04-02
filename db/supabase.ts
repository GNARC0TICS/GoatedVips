/**
 * Supabase Database Connection Setup
 * 
 * This file provides Supabase client instances and database connection for the application.
 * It handles both authenticated and public API access to Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Environment variables from Supabase dashboard
// These should be set in .env file or environment variables
export const SUPABASE_URL = process.env.SUPABASE_URL || "https://cfbfiqcbwkaimjrzkhdf.supabase.co";
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmYmZpcWNid2thaW1qcnpraGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjM4NTUsImV4cCI6MjA1OTEzOTg1NX0.hp3VtHm7H5rPfms2hY-0Oa8kh6LZ7ByXqx0cUIe4xQk";
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ""; // Add your service key here
export const DATABASE_URL = process.env.DATABASE_URL || `postgres://postgres:[YOUR-PASSWORD]@db.cfbfiqcbwkaimjrzkhdf.supabase.co:5432/postgres`;

// Supabase client with anonymous key (for frontend)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase admin client with service key (for backend operations)
// Only available if service key is provided
export const supabaseAdmin = process.env.SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY) 
  : null;

// Database client for Drizzle ORM
// Will be initialized when DATABASE_URL is properly configured
let db: ReturnType<typeof drizzle> | null = null;

if (DATABASE_URL && DATABASE_URL.includes("[YOUR-PASSWORD]") === false) {
  try {
    const queryClient = postgres(DATABASE_URL);
    db = drizzle(queryClient);
    console.log("Supabase database connection initialized");
  } catch (error) {
    console.error("Failed to initialize Supabase database connection:", error);
  }
}

export { db };
