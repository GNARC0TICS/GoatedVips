import { db } from "./db";
import { sql } from "drizzle-orm";
import { log } from "./server/vite";

/**
 * Simpler database utility that creates the required tables
 * without requiring special permissions
 */
async function resetDatabase() {
  try {
    log("Database connection established successfully");
    log("Creating basic table schema...");

    // First check if users table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);
    
    const usersTableExists = tableCheck.rows[0]?.exists === 't' || false;
    
    if (!usersTableExists) {
      // Create users table first since others reference it
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          is_admin BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          email_verified BOOLEAN DEFAULT false,
          bio TEXT,
          profile_color TEXT DEFAULT '#D7FF00',
          goated_id TEXT UNIQUE,
          goated_username TEXT,
          goated_account_linked BOOLEAN DEFAULT false,
          last_active TIMESTAMP
        );
      `);
      log("Created users table");
      
      // Then create mock_wager_data for leaderboards
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS mock_wager_data (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          username TEXT NOT NULL,
          wagered_today DECIMAL(18, 8) NOT NULL DEFAULT '0',
          wagered_this_week DECIMAL(18, 8) NOT NULL DEFAULT '0',
          wagered_this_month DECIMAL(18, 8) NOT NULL DEFAULT '0',
          wagered_all_time DECIMAL(18, 8) NOT NULL DEFAULT '0',
          is_mocked BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          created_by INTEGER REFERENCES users(id)
        );
      `);
      log("Created mock_wager_data table");
      
      // Create support ticket tables
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          subject TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          priority TEXT NOT NULL DEFAULT 'medium',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ticket_messages (
          id SERIAL PRIMARY KEY,
          ticket_id INTEGER REFERENCES support_tickets(id),
          user_id INTEGER REFERENCES users(id),
          message TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          is_staff_reply BOOLEAN NOT NULL DEFAULT false
        );
      `);
      log("Created support ticket tables");
    } else {
      log("Users table already exists, skipping creation");
    }
    
    // Create an admin user for testing
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    try {
      await db.execute(sql`
        INSERT INTO users (username, password, email, is_admin, profile_color)
        VALUES (${adminUsername}, ${adminPassword}, 'admin@example.com', true, '#D7FF00')
        ON CONFLICT (username) DO NOTHING;
      `);
      log("Created/verified admin user");
    } catch (err) {
      log(`Warning: Could not create admin user: ${err}`);
    }
    
    // Create test users for development
    try {
      // Create regular test users
      for (let i = 1; i <= 5; i++) {
        await db.execute(sql`
          INSERT INTO users (username, password, email, bio, profile_color)
          VALUES (
            ${'testuser' + i}, 
            ${'password' + i}, 
            ${'testuser' + i + '@example.com'}, 
            ${'Bio for test user ' + i}, 
            ${['#D7FF00', '#FF4500', '#00BFFF', '#32CD32', '#FF1493'][i-1] || '#D7FF00'}
          )
          ON CONFLICT (username) DO NOTHING;
        `);
      }
      log("Created test user accounts");
    } catch (err) {
      log(`Warning: Could not create test users: ${err}`);
    }
    
    log("Database setup complete");
  } catch (error) {
    log(`Database setup error: ${error}`);
    throw error;
  }
}

// Run the function
resetDatabase().catch(console.error);