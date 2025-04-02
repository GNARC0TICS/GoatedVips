/**
 * Supabase Database Connection Setup
 * 
 * This file provides Supabase client instances and database connection for the application.
 * It handles both authenticated and public API access to Supabase.
 */
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Environment variables for Supabase
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Database URL for direct Postgres connection via Drizzle
export const DATABASE_URL = process.env.DATABASE_URL || '';

// Initialize Supabase client with anonymous key (public access)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Initialize Supabase admin client with service role key (admin access)
export const supabaseAdmin = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Get current authenticated user from Supabase
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Database connection for Drizzle ORM
const sql = DATABASE_URL
  ? postgres(DATABASE_URL, { max: 10, ssl: true })
  : null;

// Initialize Drizzle ORM with schema
export const db = sql ? drizzle(sql, { schema }) : null;