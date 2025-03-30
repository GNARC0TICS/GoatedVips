import { db } from "./db";
import { sql } from "drizzle-orm";
import { log } from "./server/vite";

async function resetDatabase() {
  try {
    // Get all table names from the database
    const result = await db.execute(sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename != 'pg_stat_statements';
    `);
    
    const tables = result.rows.map(row => row.tablename).join(', ');
    
    if (tables && tables.length > 0) {
      // Truncate all tables
      await db.execute(sql`TRUNCATE TABLE ${sql.raw(tables)} CASCADE;`);
      log("Database tables cleared successfully");
    } else {
      log("No tables found to clear");
    }
    
    log("Database reset complete");
  } catch (error) {
    log(`Error resetting database: ${error}`);
    throw error;
  }
}

// Run the function
resetDatabase().catch(console.error);