/**
 * User Service
 * Manages all user-related operations and business logic
 */
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import { AppError } from "../utils/error";
import { API_CONFIG } from "../config/api";

/**
 * User profile response format
 */
export interface UserProfile {
  id: number | string;
  username: string;
  goatedId?: string;
  goatedUsername?: string;
  email?: string;
  isNewlyCreated?: boolean;
  isPermanent?: boolean;
  isTemporary?: boolean;
  isCustom?: boolean;
}

/**
 * Get user by internal database ID
 * @param userId Internal database ID
 * @returns User profile if found
 * @throws AppError if user not found
 */
export async function getUserById(userId: number | string): Promise<UserProfile> {
  try {
    const results = await db.execute(sql`
      SELECT id, username, email, goated_id as "goatedId", goated_username as "goatedUsername"
      FROM users WHERE id::text = ${userId.toString()} LIMIT 1
    `);
    
    const user = results.rows && results.rows.length > 0 ? results.rows[0] : null;
    
    if (!user) {
      throw new AppError(404, `User with ID ${userId} not found`);
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      goatedId: user.goatedId,
      goatedUsername: user.goatedUsername
    } as UserProfile;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, `Error retrieving user by ID: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get user by Goated ID
 * @param goatedId External Goated platform ID
 * @returns User profile if found
 * @throws AppError if user not found
 */
export async function getUserByGoatedId(goatedId: string): Promise<UserProfile> {
  try {
    const results = await db.execute(sql`
      SELECT id, username, email, goated_id as "goatedId", goated_username as "goatedUsername"
      FROM users WHERE goated_id = ${goatedId} LIMIT 1
    `);
    
    const user = results.rows && results.rows.length > 0 ? results.rows[0] : null;
    
    if (!user) {
      throw new AppError(404, `User with Goated ID ${goatedId} not found`);
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      goatedId: user.goatedId,
      goatedUsername: user.goatedUsername
    } as UserProfile;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, `Error retrieving user by Goated ID: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Find or create a user profile
 * This is a more resilient version that handles various ID formats and creates
 * profiles when needed
 * 
 * @param userId User identifier (internal ID or Goated ID)
 * @returns User profile with additional flags indicating if it was created
 */
export async function findOrCreateUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  
  try {
    // First check if this is a numeric ID in our database
    const isNumericId = /^\d+$/.test(userId);
    
    // Try to find by direct ID match first
    try {
      const user = await getUserById(userId);
      return {
        ...user,
        isNewlyCreated: false
      };
    } catch (error) {
      // Not found by direct ID, continue to other checks
    }
    
    // If not found by direct ID, check if it's a goatedId
    try {
      const user = await getUserByGoatedId(userId);
      return {
        ...user,
        isNewlyCreated: false
      };
    } catch (error) {
      // Not found by Goated ID either, continue to creation logic
    }
    
    // No existing user, try to fetch user data from the leaderboard API if it's numeric (potential Goated ID)
    if (isNumericId) {
      const token = process.env.API_TOKEN || API_CONFIG.token;
      
      // Try to fetch user data from the leaderboard API
      let userData = null;
      
      if (token) {
        try {
          // Fetch leaderboard data which contains all users
          const leaderboardUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`;
          console.log(`Fetching leaderboard data to find user ${userId}`);
          
          const response = await fetch(leaderboardUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          });
          
          if (response.ok) {
            const leaderboardData = await response.json();
            
            // Search for the user in different time periods
            const timeframes = ['today', 'weekly', 'monthly', 'all_time'];
            
            // Look through all timeframes to find the user
            for (const timeframe of timeframes) {
              const users = leaderboardData?.data?.[timeframe]?.data || [];
              
              // Find the user with the matching UID
              const foundUser = users.find((user: any) => user.uid === userId);
              
              if (foundUser) {
                userData = foundUser;
                console.log("Successfully found user in leaderboard data:", userData);
                break;
              }
            }
            
            if (!userData) {
              console.log(`User ID ${userId} not found in any leaderboard timeframe`);
            }
          } else {
            console.log(`Failed to fetch leaderboard data: ${response.status}`);
          }
        } catch (apiError) {
          console.error("Error fetching from leaderboard API:", apiError);
        }
      }
      
      // Attempt to retrieve the actual username from the Goated API data
      const username = userData?.name || null;
      
      if (userData && username) {
        // We have valid data from the API, create a permanent profile for this Goated user
        try {
          const newUserId = Math.floor(1000 + Math.random() * 9000);
          const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@goated.placeholder.com`;
          
          // Create a more complete profile with the real data from Goated
          const result = await db.execute(sql`
            INSERT INTO users (
              id, username, email, password, created_at, profile_color, 
              bio, is_admin, goated_id, goated_username, goated_account_linked
            ) VALUES (
              ${newUserId}, ${username}, ${email}, '', ${new Date()}, '#D7FF00', 
              'Official Goated.com player profile', false, ${userId}, ${username}, true
            ) RETURNING id, username, goated_id as "goatedId", goated_username as "goatedUsername"
          `);
          
          if (result && result.rows && result.rows.length > 0) {
            console.log(`Created permanent profile for Goated player ${username} (${userId})`);
            const user = result.rows[0];
            return {
              id: user.id,
              username: user.username,
              goatedId: user.goatedId,
              goatedUsername: user.goatedUsername,
              isNewlyCreated: true,
              isPermanent: true
            } as UserProfile;
          }
        } catch (insertError) {
          console.error(`Failed to create permanent user profile for Goated ID ${userId}:`, insertError);
          throw new AppError(500, `Failed to create user profile: ${insertError instanceof Error ? insertError.message : String(insertError)}`);
        }
      } else {
        // No user data found in leaderboard, create a temporary placeholder profile
        try {
          const newUserId = Math.floor(1000 + Math.random() * 9000);
          // Use 'Goated User' instead of 'Player_' to match the site's branding
          const tempUsername = `Goated User ${userId}`;
          const email = `user_${userId}@goated.placeholder.com`;
          
          // Create a placeholder profile with clear indication this is temporary
          const result = await db.execute(sql`
            INSERT INTO users (
              id, username, email, password, created_at, profile_color, 
              bio, is_admin, goated_id, goated_account_linked
            ) VALUES (
              ${newUserId}, ${tempUsername}, ${email}, '', ${new Date()}, '#D7FF00', 
              'Temporary profile - this player has not been verified with Goated.com yet', false, ${userId}, false
            ) RETURNING id, username, goated_id as "goatedId", goated_username as "goatedUsername"
          `);
          
          if (result && result.rows && result.rows.length > 0) {
            console.log(`Created temporary profile for unknown Goated ID ${userId}`);
            const user = result.rows[0];
            return {
              id: user.id,
              username: user.username,
              goatedId: user.goatedId,
              goatedUsername: user.goatedUsername,
              isNewlyCreated: true,
              isTemporary: true
            } as UserProfile;
          }
        } catch (insertError) {
          console.error(`Failed to create temporary user profile for ID ${userId}:`, insertError);
          throw new AppError(500, `Failed to create temporary user profile: ${insertError instanceof Error ? insertError.message : String(insertError)}`);
        }
      }
    } else {
      // Handle non-numeric IDs (like UUIDs or custom strings)
      try {
        const shortId = userId.substring(0, 8); // Use first 8 chars of UUID/string
        const newUserId = Math.floor(1000 + Math.random() * 9000);
        const username = `Goated Custom ${shortId}`;
        const email = `custom_${shortId}@goated.placeholder.com`;
        
        // Clear indication this is a non-Goated profile
        const result = await db.execute(sql`
          INSERT INTO users (
            id, username, email, password, created_at, profile_color, 
            bio, is_admin, goated_id, goated_account_linked
          ) VALUES (
            ${newUserId}, ${username}, ${email}, '', ${new Date()}, '#D7FF00', 
            'Custom profile - not linked to Goated.com', false, ${userId}, false
          ) RETURNING id, username, goated_id as "goatedId", goated_username as "goatedUsername"
        `);
        
        if (result && result.rows && result.rows.length > 0) {
          console.log(`Created custom profile for non-numeric ID ${shortId}`);
          const user = result.rows[0];
          return {
            id: user.id,
            username: user.username,
            goatedId: user.goatedId,
            goatedUsername: user.goatedUsername,
            isNewlyCreated: true,
            isCustom: true
          } as UserProfile;
        }
      } catch (insertError) {
        console.error(`Failed to create custom profile for ID ${userId}:`, insertError);
        throw new AppError(500, `Failed to create custom profile: ${insertError instanceof Error ? insertError.message : String(insertError)}`);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error ensuring profile for ID ${userId}:`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, `Error finding or creating user profile: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a list of users with optional filtering and pagination
 * @param limit Maximum number of users to return
 * @param offset Pagination offset
 * @returns Array of user profiles
 */
export async function getUsers(limit = 20, offset = 0): Promise<UserProfile[]> {
  try {
    const result = await db.execute(sql`
      SELECT id, username, email, goated_id as "goatedId", goated_username as "goatedUsername" 
      FROM users
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    
    if (!result.rows || result.rows.length === 0) {
      return [];
    }
    
    // Map each row to a properly typed UserProfile object
    return result.rows.map(row => ({
      id: row.id,
      username: row.username,
      email: row.email,
      goatedId: row.goatedId,
      goatedUsername: row.goatedUsername
    } as UserProfile));
  } catch (error) {
    throw new AppError(500, `Error fetching users: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update user profile
 * @param userId User ID
 * @param userData Updated user data
 * @returns Updated user profile
 * @throws AppError if user not found or update fails
 */
export async function updateUser(userId: number | string, userData: Partial<UserProfile>): Promise<UserProfile> {
  try {
    // First check if the user exists
    await getUserById(userId);
    
    // Prepare update columns
    const updates: Record<string, any> = {};
    
    if (userData.username) updates.username = userData.username;
    if (userData.email) updates.email = userData.email;
    
    // Build the SQL update statement
    const updateValues = Object.entries(updates)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(', ');
    
    if (!updateValues) {
      throw new AppError(400, "No valid update fields provided");
    }
    
    const result = await db.execute(sql`
      UPDATE users
      SET ${sql.raw(updateValues)}, updated_at = ${new Date()}
      WHERE id::text = ${userId.toString()}
      RETURNING id, username, email, goated_id as "goatedId", goated_username as "goatedUsername"
    `);
    
    if (!result.rows || result.rows.length === 0) {
      throw new AppError(404, `User with ID ${userId} not found during update`);
    }
    
    const user = result.rows[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      goatedId: user.goatedId,
      goatedUsername: user.goatedUsername
    } as UserProfile;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, `Error updating user: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Delete user profile
 * @param userId User ID
 * @returns Success message
 * @throws AppError if user not found or deletion fails
 */
export async function deleteUser(userId: number | string): Promise<{ success: boolean; message: string }> {
  try {
    // First check if the user exists
    await getUserById(userId);
    
    await db.execute(sql`DELETE FROM users WHERE id::text = ${userId.toString()}`);
    
    return {
      success: true,
      message: `User with ID ${userId} successfully deleted`
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, `Error deleting user: ${error instanceof Error ? error.message : String(error)}`);
  }
}