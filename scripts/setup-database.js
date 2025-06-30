
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🔍 Setting up GoatedVIPs Database...');
  
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const client = await pool.connect();
    
    // Check if our tables exist
    const { rows } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'wager_stats', 'user_sessions')
    `);
    
    console.log('📋 Found tables:', rows.map(r => r.table_name));
    
    if (rows.length === 0) {
      console.log('🏗️  No tables found. Running schema setup...');
      
      // Read and execute schema
      const schemaSQL = fs.readFileSync(path.join(__dirname, '../backend-db/schema.sql'), 'utf8');
      await client.query(schemaSQL);
      
      console.log('✅ Database schema created successfully');
    } else {
      console.log('✅ Database tables already exist');
    }
    
    // Verify admin user exists
    const adminCheck = await client.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['admin']);
    if (adminCheck.rows.length === 0) {
      console.log('👑 Creating admin user...');
      await client.query(`
        INSERT INTO users (username, email, password_hash, role, email_verified) 
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin', 'admin@goatedvips.gg', '$2b$12$LQv3c1yqBwcVsvUyqrB0R.L2a9M4KhJhWJgZPvIm3pY8QpOI3aBc2', 'admin', true]);
      console.log('✅ Admin user created (admin@goatedvips.gg / AdminPassword123!)');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    client.release();
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
