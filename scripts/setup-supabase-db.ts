import { setupSupabaseDatabase } from '../db/setup-supabase';

/**
 * Script to set up Supabase database tables
 * Run with: npx tsx scripts/setup-supabase-db.ts
 */
async function main() {
  console.log('Starting Supabase database setup...');
  
  try {
    const success = await setupSupabaseDatabase();
    
    if (success) {
      console.log('✅ Supabase database setup completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Supabase database setup failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Supabase database setup failed with error:', error);
    process.exit(1);
  }
}

// Run the script
main();