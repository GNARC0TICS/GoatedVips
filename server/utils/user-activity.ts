
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
    // Find users whose activity status needs to be updated
    // This avoids updating users whose status is already correct
    const needsActiveStatus = await db
      .select({ id: users.id })
      .from(users)
      .where(
        sql`${users.total_wager} > 0 AND ${users.isActive} = false`
      );
    
    const needsInactiveStatus = await db
      .select({ id: users.id })
      .from(users)
      .where(
        sql`${users.total_wager} = 0 AND ${users.isActive} = true`
      );
    
    // Only update users that need their status changed
    const [activeUpdates, inactiveUpdates] = await Promise.all([
      needsActiveStatus.length > 0 ? 
        db.update(users)
          .set({ isActive: true })
          .where(
            sql`id IN (${needsActiveStatus.map(u => u.id).join(',')})`
          )
          .returning({ id: users.id }) : 
        Promise.resolve([]),
        
      needsInactiveStatus.length > 0 ?
        db.update(users)
          .set({ isActive: false })
          .where(
            sql`id IN (${needsInactiveStatus.map(u => u.id).join(',')})`
          )
          .returning({ id: users.id }) :
        Promise.resolve([])
    ]);
    
    return { 
      updated: activeUpdates.length + inactiveUpdates.length 
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
