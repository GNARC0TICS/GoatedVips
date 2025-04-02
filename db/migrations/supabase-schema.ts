import { sql } from 'drizzle-orm';
import { db } from '../supabase';
import * as schema from '../schema/supabase-users';

/**
 * Initializes Supabase database schema
 * Creates necessary tables and relationships for the application
 */
export async function initSupabaseSchema() {
  try {
    console.log('Initializing Supabase schema...');
    
    // Create user_roles table (not managed by Supabase Auth)
    await db?.execute(sql`
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(user_id)
      );
    `);
    
    // Create profiles table (extended user data)
    await db?.execute(sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        username TEXT UNIQUE,
        email TEXT NOT NULL,
        bio TEXT,
        profile_color TEXT DEFAULT '#D7FF00',
        profile_image TEXT,
        goated_id TEXT UNIQUE,
        goated_username TEXT,
        goated_account_linked BOOLEAN DEFAULT false,
        link_status TEXT DEFAULT 'not_linked',
        telegram_id TEXT UNIQUE,
        telegram_username TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    
    // Create RLS policies for profiles
    await db?.execute(sql`
      -- Enable RLS on profiles
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      
      -- Create policies
      CREATE POLICY "Public profiles are viewable by everyone"
        ON profiles FOR SELECT
        USING (true);
      
      CREATE POLICY "Users can update own profile"
        ON profiles FOR UPDATE
        USING (auth.uid() = id);
        
      CREATE POLICY "Users can insert own profile"
        ON profiles FOR INSERT
        WITH CHECK (auth.uid() = id);
    `);
    
    // Create wager_races table
    await db?.execute(sql`
      CREATE TABLE IF NOT EXISTS wager_races (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK (status IN ('upcoming', 'live', 'ended', 'cancelled')) DEFAULT 'upcoming',
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        prize_pool NUMERIC(10,2) NOT NULL DEFAULT 500,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    
    // Create wager_race_participants table
    await db?.execute(sql`
      CREATE TABLE IF NOT EXISTS wager_race_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        race_id UUID NOT NULL REFERENCES wager_races(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        external_user_id TEXT,
        name TEXT NOT NULL,
        wagered NUMERIC(18,2) NOT NULL DEFAULT 0,
        position INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT check_user_id_or_external_id CHECK (
          (user_id IS NOT NULL) OR (external_user_id IS NOT NULL)
        )
      );
    `);
    
    // Create bonus_codes table
    await db?.execute(sql`
      CREATE TABLE IF NOT EXISTS bonus_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        value NUMERIC(10,2) NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'item')),
        max_uses INTEGER,
        used_count INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true,
        created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    
    // Create bonus_code_claims table
    await db?.execute(sql`
      CREATE TABLE IF NOT EXISTS bonus_code_claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code_id UUID NOT NULL REFERENCES bonus_codes(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        status TEXT NOT NULL CHECK (status IN ('pending', 'processed', 'rejected')) DEFAULT 'pending',
        processed_at TIMESTAMP WITH TIME ZONE,
        processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        notes TEXT,
        UNIQUE(code_id, user_id)
      );
    `);
    
    // Create support_tickets table
    await db?.execute(sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        external_user_id TEXT,
        title TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
        priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        CONSTRAINT check_user_id_or_external_id CHECK (
          (user_id IS NOT NULL) OR (external_user_id IS NOT NULL)
        )
      );
    `);
    
    // Create ticket_messages table
    await db?.execute(sql`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        external_user_id TEXT,
        message TEXT NOT NULL,
        is_staff_reply BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        CONSTRAINT check_user_id_or_external_id CHECK (
          (user_id IS NOT NULL) OR (external_user_id IS NOT NULL)
        )
      );
    `);
    
    // Create affiliate_stats table
    await db?.execute(sql`
      CREATE TABLE IF NOT EXISTS affiliate_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        wagered NUMERIC(18,2) NOT NULL,
        period TEXT NOT NULL CHECK (period IN ('today', 'weekly', 'monthly', 'all_time')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(external_user_id, period)
      );
    `);
    
    // Create historical_races table
    await db?.execute(sql`
      CREATE TABLE IF NOT EXISTS historical_races (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        race_id TEXT NOT NULL,
        title TEXT NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        winner_name TEXT,
        winner_id TEXT,
        total_participants INTEGER NOT NULL DEFAULT 0,
        prize_pool NUMERIC(10,2) NOT NULL DEFAULT 500,
        data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    
    // Create functions and triggers for updated_at
    await db?.execute(sql`
      -- Function to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      -- Add triggers for all tables with updated_at
      CREATE TRIGGER update_profiles_modtime
        BEFORE UPDATE ON profiles
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
        
      CREATE TRIGGER update_wager_races_modtime
        BEFORE UPDATE ON wager_races
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
        
      CREATE TRIGGER update_wager_race_participants_modtime
        BEFORE UPDATE ON wager_race_participants
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
        
      CREATE TRIGGER update_bonus_codes_modtime
        BEFORE UPDATE ON bonus_codes
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
        
      CREATE TRIGGER update_support_tickets_modtime
        BEFORE UPDATE ON support_tickets
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
        
      CREATE TRIGGER update_affiliate_stats_modtime
        BEFORE UPDATE ON affiliate_stats
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
    `);
    
    console.log('Supabase schema initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Supabase schema:', error);
    return false;
  }
}