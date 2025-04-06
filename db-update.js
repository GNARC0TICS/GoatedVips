import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';

/**
 * A simple utility to push database schema updates
 */

const sql = neon(process.env.DATABASE_URL);

async function updateDatabase() {
  console.log('Checking for missing columns...');
  
  try {
    // Add missing columns if needed
    await sql`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS goated_link_requested BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS goated_username_requested TEXT`;
    await sql`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS goated_link_requested_at TIMESTAMP`;
    await sql`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS email_verification_token TEXT`;
    await sql`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP`;
    await sql`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP`;
    
    console.log('Database updated successfully!');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    process.exit(0);
  }
}

updateDatabase();