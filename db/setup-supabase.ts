import { supabase, supabaseAdmin } from './supabase';
import { sql } from 'drizzle-orm';

/**
 * Initialize the Supabase database tables
 * Creates all the tables required for the application
 */
export async function setupSupabaseDatabase() {
  try {
    console.log('Setting up Supabase database tables...');
    
    // Create tables using Supabase service role client to execute SQL
    // This requires SUPABASE_SERVICE_KEY to be set
    
    if (!supabaseAdmin) {
      throw new Error('Supabase Admin client not available. Make sure SUPABASE_SERVICE_KEY is set.');
    }
    
    // Create user_roles table
    const { error: userRolesError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(user_id)
        );
      `
    });
    
    if (userRolesError) {
      console.error('Error creating user_roles table:', userRolesError);
    }
    
    // Create profiles table
    const { error: profilesError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.profiles (
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
      `
    });
    
    if (profilesError) {
      console.error('Error creating profiles table:', profilesError);
    }
    
    // Create wager_races table
    const { error: wagerRacesError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.wager_races (
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
      `
    });
    
    if (wagerRacesError) {
      console.error('Error creating wager_races table:', wagerRacesError);
    }
    
    // Create wager_race_participants table
    const { error: participantsError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.wager_race_participants (
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
      `
    });
    
    if (participantsError) {
      console.error('Error creating wager_race_participants table:', participantsError);
    }
    
    // Create bonus_codes table
    const { error: bonusCodesError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.bonus_codes (
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
      `
    });
    
    if (bonusCodesError) {
      console.error('Error creating bonus_codes table:', bonusCodesError);
    }
    
    // Create bonus_code_claims table
    const { error: claimsError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.bonus_code_claims (
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
      `
    });
    
    if (claimsError) {
      console.error('Error creating bonus_code_claims table:', claimsError);
    }
    
    // Create support_tickets table
    const { error: ticketsError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.support_tickets (
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
      `
    });
    
    if (ticketsError) {
      console.error('Error creating support_tickets table:', ticketsError);
    }
    
    // Create ticket_messages table
    const { error: messagesError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.ticket_messages (
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
      `
    });
    
    if (messagesError) {
      console.error('Error creating ticket_messages table:', messagesError);
    }
    
    // Create affiliate_stats table
    const { error: statsError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.affiliate_stats (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          external_user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          wagered NUMERIC(18,2) NOT NULL,
          period TEXT NOT NULL CHECK (period IN ('today', 'weekly', 'monthly', 'all_time')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(external_user_id, period)
        );
      `
    });
    
    if (statsError) {
      console.error('Error creating affiliate_stats table:', statsError);
    }
    
    // Create historical_races table
    const { error: historicalError } = await supabaseAdmin.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.historical_races (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          race_id TEXT NOT NULL,
          title TEXT NOT NULL,
          start_date TIMESTAMP WITH TIME ZONE NOT NULL,
          end_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
          winner_name TEXT,
          winner_id TEXT,
          total_participants INTEGER NOT NULL DEFAULT 0,
          prize_pool NUMERIC(10,2) NOT NULL DEFAULT 500,
          data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });
    
    if (historicalError) {
      console.error('Error creating historical_races table:', historicalError);
    }
    
    // Create admin user if doesn't exist
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      // Check if admin user exists
      const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (getUserError) {
        console.error('Error listing users:', getUserError);
      } else {
        const adminExists = users.users.some(user => 
          user.email === process.env.ADMIN_EMAIL && 
          user.app_metadata && user.app_metadata.role === 'admin'
        );
        
        if (!adminExists) {
          // Create admin user
          const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            email_confirm: true,
            app_metadata: { role: 'admin' },
            user_metadata: { isAdmin: true }
          });
          
          if (createError) {
            console.error('Error creating admin user:', createError);
          } else if (data.user) {
            console.log('Admin user created successfully');
            
            // Add admin role to user_roles table
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: data.user.id,
                role: 'admin'
              });
              
            if (roleError) {
              console.error('Error creating admin role:', roleError);
            } else {
              console.log('Admin role assigned successfully');
            }
          }
        } else {
          console.log('Admin user already exists');
        }
      }
    }
    
    console.log('Supabase database tables setup completed');
    return true;
  } catch (error) {
    console.error('Error setting up Supabase database:', error);
    return false;
  }
}