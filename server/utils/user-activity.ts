
import { db } from "@db";
import { users } from "@db/schema";
import { eq, gt, sql } from "drizzle-orm";

/**
 * Updates the isActive status for users based on wager data
 * A user is considered active if they have any wager activity (total_wager > 0)
 * 
 * @returns {Promise<{ updated: number, active: number, inactive: number }>} Number of user records updated and activity counts
 */
export async function updateUserActivityStatus(): Promise<{ 
  updated: number, 
  active: number, 
  inactive: number 
}> {
  try {
    // Instead of updating an isActive column, we'll just count the active users
    // based on their total_wager value
    
    // Get the counts of active and inactive users
    const { active, inactive } = await getUserActivityStats();
    
    return { 
      updated: 0, // No updates performed as we're just using the total_wager directly
      active,
      inactive
    };
  } catch (error) {
    console.error("Error updating user activity status:", error);
    throw error;
  }
}

/**
 * Gets counts of active and inactive users
 * 
 * @returns {Promise<{active: number, inactive: number, total: number}>} User activity counts
 */
export async function getUserActivityStats(): Promise<{
  active: number;
  inactive: number;
  total: number;
}> {
  try {
    // Use total_wager to determine activity status
    const result = await db.execute(
      sql`SELECT 
        SUM(CASE WHEN total_wager > 0 THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN total_wager = 0 THEN 1 ELSE 0 END) as inactive_count,
        COUNT(*) as total_count
      FROM users`
    );
    
    const row = result.rows[0];
    
    return {
      active: Number(row.active_count || 0),
      inactive: Number(row.inactive_count || 0),
      total: Number(row.total_count || 0)
    };
  } catch (error) {
    console.error("Error fetching user activity stats:", error);
    throw error;
  }
}

/**
 * Gets a list of most active users based on recent wager activity
 * 
 * @param {number} limit - Maximum number of users to return
 * @returns {Promise<Array<{id: number, username: string, goatedId: string, total_wager: number}>>} List of active users
 */
export async function getMostActiveUsers(limit: number = 100): Promise<Array<{
  id: number;
  username: string;
  goatedId: string;
  total_wager: number;
}>> {
  try {
    return await db
      .select({
        id: users.id,
        username: users.username,
        goatedId: users.goatedId,
        total_wager: users.total_wager
      })
      .from(users)
      .where(gt(users.total_wager, 0))  // Active users have total_wager > 0
      .orderBy(sql`users.total_wager DESC`)
      .limit(limit);
  } catch (error) {
    console.error("Error fetching most active users:", error);
    throw error;
  }
}
