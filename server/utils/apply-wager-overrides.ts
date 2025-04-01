import { wagerOverrides } from '../../db/schema';
import { db } from '../../db';
import { eq, and } from 'drizzle-orm';

/**
 * Applies active wager overrides to leaderboard data
 * 
 * This utility checks if any users in the leaderboard have
 * active overrides in the database, and applies those override
 * values to the user's wager amounts before returning
 * the updated leaderboard data.
 * 
 * @param leaderboardData - The original leaderboard data from the API
 * @returns The modified leaderboard data with overrides applied
 */
export async function applyWagerOverrides(leaderboardData: any): Promise<any> {
  // If there's no data, return as-is
  if (!leaderboardData || !leaderboardData.results) {
    return leaderboardData;
  }

  try {
    // Collect all usernames from the leaderboard
    const usernames = leaderboardData.results.map((entry: any) => entry.username);
    
    if (usernames.length === 0) {
      return leaderboardData;
    }
    
    // Fetch all active overrides for users in the leaderboard
    const activeOverrides = await db.query.wagerOverrides.findMany({
      where: and(
        eq(wagerOverrides.active, true)
      )
    });
    
    // If no active overrides, return the original data
    if (activeOverrides.length === 0) {
      return leaderboardData;
    }
    
    // Index overrides by username for faster lookup
    const overridesByUsername: Record<string, any> = {};
    
    // Process overrides - remove expired ones and index the rest
    for (const override of activeOverrides) {
      // Skip if override has expired
      if (override.expires_at && new Date(override.expires_at) < new Date()) {
        // Mark as inactive in database
        await db.update(wagerOverrides)
          .set({ active: false })
          .where(eq(wagerOverrides.id, override.id));
        continue;
      }
      
      overridesByUsername[override.username] = override;
    }
    
    // Apply overrides to leaderboard data
    const updatedResults = leaderboardData.results.map((entry: any) => {
      const override = overridesByUsername[entry.username];
      
      if (override) {
        // Create a new object to avoid modifying the original
        const updatedEntry = { ...entry };
        
        // Apply overrides where they exist
        if (override.today_override !== null) {
          updatedEntry.today = parseFloat(override.today_override);
        }
        
        if (override.this_week_override !== null) {
          updatedEntry.this_week = parseFloat(override.this_week_override);
        }
        
        if (override.this_month_override !== null) {
          updatedEntry.this_month = parseFloat(override.this_month_override);
        }
        
        if (override.all_time_override !== null) {
          updatedEntry.all_time = parseFloat(override.all_time_override);
        }
        
        return updatedEntry;
      }
      
      return entry;
    });
    
    // Log the overrides that were applied
    const appliedOverrides = Object.values(overridesByUsername).filter(
      override => overridesByUsername[override.username]
    );
    
    if (appliedOverrides.length > 0) {
      console.log(`Applied ${appliedOverrides.length} wager overrides to leaderboard data:`);
      appliedOverrides.forEach((override: any) => {
        console.log(`  - ${override.username}: ${
          [
            override.today_override ? `today=${override.today_override}` : '',
            override.this_week_override ? `week=${override.this_week_override}` : '',
            override.this_month_override ? `month=${override.this_month_override}` : '',
            override.all_time_override ? `all-time=${override.all_time_override}` : ''
          ].filter(Boolean).join(', ')
        }`);
      });
    }
    
    // Return the updated data
    return {
      ...leaderboardData,
      results: updatedResults
    };
  } catch (error) {
    console.error('Error applying wager overrides:', error);
    // Return original data if there's an error
    return leaderboardData;
  }
}