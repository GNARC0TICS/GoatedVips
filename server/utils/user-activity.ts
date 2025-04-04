
import { db } from "@db";
import { users } from "@db/schema";
import { eq, gt } from "drizzle-orm";

/**
 * Updates the isActive status for users based on wager data
 * A user is considered active if they have any wager activity (total_wager > 0)
 * 
 * @returns {Promise<{ updated: number }>} Number of user records updated
 */
export async function updateUserActivityStatus(): Promise<{ updated: number }> {
  try {
    // Mark users as active if they have wager data
    const activeUsers = await db
      .update(users)
      .set({ isActive: true })
      .where(gt(users.total_wager, 0))
      .returning({ id: users.id });
    
    // Mark users as inactive if they have no wager data
    const inactiveUsers = await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.total_wager, 0))
      .returning({ id: users.id });
    
    return { 
      updated: activeUsers.length + inactiveUsers.length 
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
    const [activeCount, inactiveCount] = await Promise.all([
      db.select({ count: db.fn.count() }).from(users).where(eq(users.isActive, true)),
      db.select({ count: db.fn.count() }).from(users).where(eq(users.isActive, false))
    ]);
    
    const active = Number(activeCount[0]?.count || 0);
    const inactive = Number(inactiveCount[0]?.count || 0);
    
    return {
      active,
      inactive,
      total: active + inactive
    };
  } catch (error) {
    console.error("Error fetching user activity stats:", error);
    throw error;
  }
}
