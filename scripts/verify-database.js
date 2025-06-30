
const { Pool } = require('pg');
require('dotenv').config();

async function verifyDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Verifying database setup...\n');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tables = ['users', 'user_sessions', 'wager_stats', 'wager_entries', 'wager_adjustments', 'races', 'race_participants'];
    
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' missing`);
      }
    }
    
    // Check for admin user
    const adminCheck = await client.query(`
      SELECT username, role FROM users WHERE role = 'admin' LIMIT 1;
    `);
    
    if (adminCheck.rows.length > 0) {
      console.log(`✅ Admin user exists: ${adminCheck.rows[0].username}`);
    } else {
      console.log('❌ No admin user found');
    }
    
    client.release();
    console.log('\n🎉 Database verification complete');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

verifyDatabase();
