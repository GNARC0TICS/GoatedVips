/**
 * User utilities for profile management
 * 
 * Contains functions for:
 * - Creating/finding user profiles
 * - User data transformation
 * - Profile validation
 */

import { db } from '@db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';

// Custom error class for user operations
export class UserError extends Error {
  status: number;
  
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'UserError';
    this.status = status;
  }
}

/**
 * Find a user by their internal ID
 */
export async function findUserById(id: number) {
  console.log(`Executing SQL query for ID ${id}`);
  
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    
    console.log('Extracted user by ID:', user);
    return user;
  } catch (error) {
    console.error(`Error finding user by ID ${id}:`, error);
    throw new UserError(`Error finding user by ID: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Find a user by their Goated ID
 */
export async function findUserByGoatedId(goatedId: string) {
  console.log(`Looking up user by Goated ID: ${goatedId}`);
  
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.goatedId, goatedId)
    });
    
    return user;
  } catch (error) {
    console.error(`Error finding user by Goated ID ${goatedId}:`, error);
    throw new UserError(`Error finding user by Goated ID: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates or retrieves a profile for a specific user ID
 * 
 * This function handles the following scenarios:
 * 1. Finding existing users by their internal database ID
 * 2. Finding existing users by their Goated ID
 * 3. Creating new permanent profiles for users found in the Goated.com leaderboard API
 * 4. Creating temporary placeholder profiles for users not found in the API
 * 
 * @param userId - The user ID (numeric internal ID or external Goated ID)
 * @returns User object with isNewlyCreated flag if found/created, null otherwise
 */
export async function ensureUserProfile(userId: string) {
  console.log(`Ensuring profile exists for ID: ${userId}`);
  
  try {
    // Check if it's a numeric ID or a Goated ID
    const isNumericId = /^\d+$/.test(userId);
    console.log(`Is numeric ID: ${isNumericId}`);
    
    if (isNumericId) {
      // It's a numeric ID, check if it exists in our database
      const user = await findUserById(parseInt(userId));
      
      if (user) {
        console.log(`Returning user: ${JSON.stringify(user)}`);
        return {
          ...user,
          isNewlyCreated: false
        };
      }
      
      // If not found, we can't create it without external data
      console.log(`User with ID ${userId} not found in database`);
      return null;
    }
    
    // It's a Goated ID, look up in our database first
    const existingUser = await findUserByGoatedId(userId);
    
    if (existingUser) {
      console.log(`Found existing user with Goated ID ${userId}`);
      return {
        ...existingUser,
        isNewlyCreated: false
      };
    }
    
    // Not found, try to fetch from external API and create
    // TODO: Implement API call to fetch user data if needed
    
    // For now, create a placeholder user
    const shortId = userId.substring(0, 8); // Truncate if too long
    
    try {
      // Create a new user profile with the Goated ID
      const result = await db.insert(users)
        .values({
          username: `User_${shortId}`,
          goatedId: userId,
          bio: 'Placeholder profile - not verified',
          profileColor: '#D7FF00',
          isVerified: false
        })
        .returning();
      
      if (result && result.length > 0) {
        console.log(`Created placeholder profile for Goated ID ${userId}`);
        return {
          ...result[0],
          isNewlyCreated: true
        };
      }
    } catch (insertError) {
      console.error(`Failed to create profile for ID ${userId}:`, insertError);
      throw new UserError(`Failed to create profile: ${insertError instanceof Error ? insertError.message : String(insertError)}`);
    }
    
    return null;
  } catch (error) {
    console.error(`Error ensuring profile for ID ${userId}:`, error);
    throw error instanceof UserError 
      ? error 
      : new UserError(`Error finding or creating user profile: ${error instanceof Error ? error.message : String(error)}`);
  }
}