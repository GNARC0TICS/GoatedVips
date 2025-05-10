import { Router } from "express";
import { db } from "@db";
import { users } from "@db/schema";
import type { SelectUser } from "@db/schema";
import { like, desc, eq, sql } from "drizzle-orm";
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { API_CONFIG } from "../config/api";
import bcrypt from 'bcrypt';
import { ensureUserProfile } from "../index";
import { getApiToken, getApiHeaders } from "../utils/api-token";
import { findUserByGoatedId } from "../utils/api-utils";

// Type definitions for missing properties
type IpHistoryEntry = { ip: string; timestamp: Date; };
type LoginHistoryEntry = { timestamp: Date; success: boolean; ip?: string; };
type ActivityLogEntry = { action: string; timestamp: Date; details?: any; };

// Extended user type with optional fields we might need
interface ExtendedUser {
  // Base fields from SelectUser
  id: number;
  username: string;
  password: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  emailVerified: boolean | null;
  bio: string | null;
  profileColor: string | null;
  goatedId: string | null;
  goatedUsername: string | null;
  goatedAccountLinked: boolean | null;
  lastActive: Date | null;
  telegramUsername?: string | null;
  
  // Extended fields
  telegramVerifiedAt?: Date | null;
  telegramId?: string | null;
  lastLoginIp?: string | null;
  registrationIp?: string | null;
  country?: string | null;
  city?: string | null;
  ipHistory?: IpHistoryEntry[] | null;
  loginHistory?: LoginHistoryEntry[] | null;
  activityLogs?: ActivityLogEntry[] | null;
  suspiciousActivity?: boolean | null;
  updatedAt?: Date | null;
  
  // Security fields that might be added later
  twoFactorEnabled?: boolean | null;
}

// Setup multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

// Rate limiter middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// User search endpoint with enhanced analytics for admins
router.get("/search", async (req, res) => {
  // Support both "q" (from UserSearch component) and "username" parameters for compatibility
  const q = req.query.q as string;
  let username = req.query.username as string;
  const goatedId = req.query.goatedId as string;
  
  // If q is provided and username is not, use q as username
  if (q && !username) {
    username = q;
  }
  
  const isAdminView = req.headers['x-admin-view'] === 'true';

  // If neither username nor goatedId is provided
  if (!username && !goatedId) {
    return res.status(400).json({ error: "Either username, q, or goatedId must be provided" });
  }
  
  // Username search validation
  if (username && (typeof username !== "string" || username.length < 2)) {
    return res.status(400).json({ error: "Username must be at least 2 characters" });
  }

  try {
    let results;
    
    // Search by goatedId if provided
    if (goatedId) {
      results = await db
        .select()
        .from(users)
        .where(eq(users.goatedId, goatedId as string))
        .limit(10);
    } 
    // Otherwise search by username
    else {
      results = await db
        .select()
        .from(users)
        .where(like(users.username, `%${username}%`))
        .limit(10);
    }

    // Map results based on admin view access
    const mappedResults = results.map((user) => {
      // Cast to extended user type to support all possible fields
      const extUser = user as unknown as ExtendedUser;
      
      return {
        id: extUser.id,
        username: extUser.username,
        email: extUser.email,
        isAdmin: extUser.isAdmin,
        createdAt: extUser.createdAt,
        emailVerified: extUser.emailVerified,
        // Add profile fields
        bio: extUser.bio || '',
        profileColor: extUser.profileColor || '#D7FF00',
        goatedId: extUser.goatedId || null,
        goatedUsername: extUser.goatedUsername || null,
        // Only include sensitive data for admin view
        ...(isAdminView && {
          // Telegram related fields
          telegramId: extUser.telegramId,
          // Location and activity fields
          lastLoginIp: extUser.lastLoginIp,
          registrationIp: extUser.registrationIp,
          country: extUser.country,
          city: extUser.city,
          lastActive: extUser.lastActive,
          // Analytics fields
          ipHistory: (extUser.ipHistory || []) as IpHistoryEntry[],
          loginHistory: (extUser.loginHistory || []) as LoginHistoryEntry[],
          // Security fields
          twoFactorEnabled: extUser.twoFactorEnabled,
          suspiciousActivity: extUser.suspiciousActivity,
          activityLogs: (extUser.activityLogs || []) as ActivityLogEntry[]
        })
      };
    });

    res.json(mappedResults);
  } catch (error) {
    console.error("Error in user search:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

// Authentication routes have been removed as they are handled by the main auth.ts implementation

// NOTE: Profile image upload has been temporarily disabled
// until type compatibility issues are resolved.
// The saveProfileImage function is still available for future implementation.

// User preferences route
router.put('/profile/preferences', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const { preferences } = req.body;
        if (!preferences || typeof preferences !== 'object') {
            return res.status(400).json({ error: 'Valid preferences object is required' });
        }
        
        // Update user preferences in the database
        await updateUserPreferences(req.user.id, preferences);
        res.json({
            success: true,
            message: 'Preferences updated successfully',
            preferences
        });
    } catch (error) {
        console.error("Preference update error:", error);
        res.status(500).json({
            error: 'Failed to update preferences',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get user by ID - public endpoint 
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`User profile requested for ID: ${id}`);
    
    // Check if id is numeric or a string ID
    const isNumericId = /^\d+$/.test(id);
    console.log(`Is numeric ID: ${isNumericId}`);
    
    // Fetch user based on ID type
    let user;
    
    // Try to find user by ID using CAST to handle both numeric and string IDs
    try {
      console.log(`Executing SQL query for ID ${id}`);
      const results = await db.execute(sql`
        SELECT 
          id, 
          username, 
          bio, 
          profile_color as "profileColor", 
          created_at as "createdAt", 
          goated_id as "goatedId"
        FROM users 
        WHERE id::text = ${id}
        LIMIT 1
      `);
      
      console.log(`Query results:`, results);
      // Extract the user from the first row of results
      user = results.rows && results.rows.length > 0 ? results.rows[0] : null;
      console.log("Extracted user by ID:", user);
    } catch (findError) {
      console.log("Error finding user by ID:", findError);
      user = null;
    }
    
    // If no user found by ID and it's numeric, check if it's a Goated ID
    if (!user && isNumericId) {
      try {
        console.log(`Checking if ${id} is a Goated ID`);
        const results = await db.execute(sql`
          SELECT 
            id, 
            username, 
            bio, 
            profile_color as "profileColor", 
            created_at as "createdAt", 
            goated_id as "goatedId"
          FROM users 
          WHERE goated_id = ${id}
          LIMIT 1
        `);
        
        console.log(`Goated ID query results:`, results);
        user = results.rows && results.rows.length > 0 ? results.rows[0] : null;
        console.log("Extracted user by Goated ID:", user);
      } catch (goatedIdError) {
        console.log("Error finding user by Goated ID:", goatedIdError);
        user = null;
      }
      
      // If still no user found, try to find in leaderboard API and create profile
      if (!user) {
        try {
          console.log(`Attempting to find user in leaderboard API for ID ${id}`);
          // Try to find the user directly using our new utility function
          const foundUser = await findUserByGoatedId(id);
          
          if (foundUser) {
            console.log(`Found player in leaderboard API:`, foundUser);
            // Found a player - create a profile for them
            const userId = Math.floor(1000 + Math.random() * 9000); // Generate numeric ID for compatibility
            const email = `${foundUser.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@goated.placeholder.com`;
            
            console.log(`Creating new user with ID ${userId} for Goated player ${foundUser.name}`);
            await db.execute(sql`
              INSERT INTO users (
                id, username, email, password, created_at, profile_color, bio, is_admin, goated_id, goated_username, goated_account_linked
              ) VALUES (
                ${userId}, ${foundUser.name}, ${email}, '', ${new Date()}, '#D7FF00', 'Official Goated.com player profile', false, ${id}, ${foundUser.name}, true
              )
            `);
            
            // Now return the newly created user
            user = {
              id: userId,
              username: foundUser.name,
              bio: 'Official Goated.com player profile',
              profileColor: '#D7FF00',
              createdAt: new Date(),
              goatedId: id
            };
            
            console.log(`Created and returning new user:`, user);
          } else {
            console.log(`User ID ${id} not found in Goated API`);
          }
        } catch (apiError) {
          console.error("Error creating user from API:", apiError);
          // Continue - we'll return 404 if we can't create the user
        }
      }
    }
    
    if (!user) {
      // If user is not found, return 404
      console.log(`No user found for ID ${id}`);
      return res.status(404).json({
        error: "User not found",
      });
    }
    
    // Return user data
    console.log(`Returning user:`, user);
    res.json(user);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
});

// Create or update user profile
router.put("/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const { bio, profileColor } = req.body;
    
    console.log(`Profile update requested for ID: ${id}`);
    console.log(`Bio: ${bio}, ProfileColor: ${profileColor}`);
    
    // Check if user exists using CAST to handle both numeric and string IDs
    try {
      const results = await db.execute(sql`
        SELECT id FROM users WHERE id::text = ${id} LIMIT 1
      `);
      console.log(`Profile update check results:`, results);
      
      const existingUser = results.rows && results.rows.length > 0 ? results.rows[0] : null;
      
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update user profile
      await db.execute(sql`
        UPDATE users 
        SET bio = ${bio}, profile_color = ${profileColor}
        WHERE id::text = ${id}
      `);
      
      console.log(`Profile updated successfully for user ${id}`);
      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error finding or updating user:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Endpoint to create a user profile if it doesn't exist
router.post("/ensure-profile", async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Validate input
    if (!username || !email) {
      return res.status(400).json({ 
        error: "Username and email are required" 
      });
    }
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
      columns: { id: true }
    });
    
    if (existingUser) {
      // User already exists
      return res.json({ 
        success: true, 
        message: "User profile already exists", 
        id: existingUser.id 
      });
    }
    
    // If user doesn't exist, create a new profile using raw SQL
    const userId = uuidv4();
    await db.execute(sql`
      INSERT INTO users (
        id, username, email, password, created_at, profile_color, bio, is_admin
      ) VALUES (
        ${userId}, ${username}, ${email}, '', ${new Date()}, '#D7FF00', '', false
      )
    `);
    
    res.json({ 
      success: true, 
      message: "User profile created successfully", 
      id: userId 
    });
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    res.status(500).json({ error: "Failed to create user profile" });
  }
});

// The endpoint for ensuring a user profile exists by ID is implemented at the bottom of this file

// Function to generate verification email template (moved above but kept)
function getVerificationEmailTemplate(verificationCode: string): string {
    // Implement your themed email template generation here.  This should return an HTML string.
    // Example:
    return `<!DOCTYPE html>
    <html>
    <head>
        <title>Verification Email</title>
    </head>
    <body>
        <h1>Verify Your GoatedVIPs Account</h1>
        <p>Your verification code is: ${verificationCode}</p>
    </body>
    </html>`;
}

// Helper function for profile image handling
async function saveProfileImage(file: any): Promise<string | null> {
    if (!file) {
        console.error("No file provided for upload");
        return null;
    }
    
    try {
        // For now, return a simple URL pattern based on the file
        // In a real implementation, this would upload to a storage service
        const filename = file.filename || `profile-${Date.now()}`;
        return `/uploads/${filename}`;
    } catch (error) {
        console.error("Error saving profile image:", error);
        return null;
    }
}

// Helper function for user preferences
async function updateUserPreferences(userId: string | number, preferences: any): Promise<void> {
    if (!userId) {
        throw new Error("User ID is required");
    }
    
    try {
        // Update user preferences in the database
        await db.execute(sql`
            UPDATE users
            SET preferences = jsonb_set(preferences, '{}', ${JSON.stringify(preferences)})
            WHERE id::text = ${String(userId)}
        `);
    } catch (error) {
        console.error(`Error updating preferences for user ${userId}:`, error);
        throw new Error("Failed to update user preferences");
    }
}

// Create test users endpoint for development
router.post("/create-test-users", async (req, res) => {
  try {
    // Create 3 test users for development
    const testUsers = [
      { username: "testuser1", email: "test1@example.com", profileColor: "#D7FF00" },
      { username: "testuser2", email: "test2@example.com", profileColor: "#10B981" },
      { username: "testuser3", email: "test3@example.com", profileColor: "#3B82F6" }
    ];
    
    let createdCount = 0;
    let existingCount = 0;
    const errors = [];
    
    for (const user of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await db.select()
          .from(users)
          .where(sql`username = ${user.username}`)
          .limit(1);
        
        if (existingUser && existingUser.length > 0) {
          existingCount++;
          continue;
        }
        
        // Create a new user with bcrypt hashed password
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // Generate a unique ID starting from a high number to avoid conflicts
        const randomId = Math.floor(1000 + Math.random() * 9000);
        
        // Use raw SQL for insertion to avoid schema issues
        await db.execute(sql`
          INSERT INTO users (
            id, username, email, password, created_at, profile_color, bio, is_admin, email_verified
          ) VALUES (
            ${randomId}, ${user.username}, ${user.email}, ${hashedPassword}, ${new Date()},
            ${user.profileColor}, 'This is a test user account created for development purposes.', false, true
          )
        `);
        
        createdCount++;
        console.log(`Created test user: ${user.username} with ID ${randomId}`);
      } catch (insertError) {
        console.error(`Error creating test user ${user.username}:`, insertError);
        errors.push(`Failed to create ${user.username}: ${(insertError as Error).message}`);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Created ${createdCount} test users, ${existingCount} already existed`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error creating test users:", error);
    res.status(500).json({ error: "Failed to create test users" });
  }
});

// Sync profiles for all users in the leaderboard
router.post("/sync-profiles-from-leaderboard", async (req, res) => {
  try {
    const API_TOKEN = process.env.API_TOKEN;
    
    if (!API_TOKEN) {
      return res.status(500).json({
        error: "API_TOKEN is not configured"
      });
    }
    
    // Fetch leaderboard data to get all users
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: "Failed to fetch leaderboard data", 
        status: response.status 
      });
    }
    
    const leaderboardData = await response.json();
    
    // Process all_time data to get unique users
    const allTimeData = leaderboardData?.data?.all_time?.data || [];
    let createdCount = 0;
    let existingCount = 0;
    const errors = [];

    // Extract all UIDs from the leaderboard data
    const leaderboardUserUids = allTimeData.map(p => p.uid).filter(uid => uid);

    let existingGoatedIds = new Set<string>();

    if (leaderboardUserUids.length > 0) {
      // Fetch existing users from local DB in one query
      const existingUsersResults = await db.select({
        goatedId: users.goatedId
      })
      .from(users)
      .where(sql`${users.goatedId} IN (${sql.join(leaderboardUserUids, sql`, `)})`);
      
      existingGoatedIds = new Set(existingUsersResults.map(u => u.goatedId).filter(id => id !== null) as string[]);
    }
    
    // Process each user from the leaderboard
    for (const player of allTimeData) {
      try {
        // Skip entries without uid or name
        if (!player.uid || !player.name) continue;
        
        // Check if user already exists using the Set
        if (existingGoatedIds.has(player.uid)) {
          existingCount++;
          continue; // Skip existing users
        }
        
        // Create a new profile for this user
        const userId = uuidv4();
        const email = `${player.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@goated.placeholder.com`;
        
        await db.execute(sql`
          INSERT INTO users (
            id, username, email, password, created_at, profile_color, bio, is_admin, goated_id, goated_username, goated_account_linked
          ) VALUES (
            ${userId}, ${player.name}, ${email}, '', ${new Date()}, '#D7FF00', 'Official Goated.com player profile', false, ${player.uid}, ${player.name}, true
          )
        `);
        
        createdCount++;
      } catch (error) {
        console.error(`Error processing user ${player?.name}:`, error);
        errors.push(`Error creating profile for ${player?.name}: ${(error as Error).message}`);
      }
    }
    
    res.json({
      success: true,
      message: `Profile sync completed. Created ${createdCount} new profiles, ${existingCount} already existed.`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error syncing profiles from leaderboard:", error);
    res.status(500).json({ error: "Failed to sync profiles from leaderboard" });
  }
});

// Endpoint to get profile by Goated ID (uid from API)
router.get("/by-goated-id/:goatedId", async (req, res) => {
  try {
    const { goatedId } = req.params;
    
    if (!goatedId) {
      return res.status(400).json({ error: "Goated ID is required" });
    }
    
    // First check if user exists already
    try {
      const results = await db.execute(sql`
        SELECT 
          id, 
          username, 
          bio, 
          profile_color as "profileColor", 
          created_at as "createdAt",
          goated_id as "goatedId",
          goated_username as "goatedUsername",
          goated_account_linked as "goatedAccountLinked"
        FROM users 
        WHERE goated_id = ${goatedId}
        LIMIT 1
      `);
      
      // Extract the user from the first row of results
      const user = results.rows && results.rows.length > 0 ? results.rows[0] : null;
      
      if (user) {
        console.log(`Found existing profile for Goated ID ${goatedId}`);
        return res.json({
          ...user,
          isLinked: user.goatedAccountLinked
        });
      }
      
      // No existing user, use our improved ensureUserProfile function to create one
      console.log(`No profile found for Goated ID ${goatedId}, creating one...`);
      const newUser = await ensureUserProfile(goatedId);
      
      if (!newUser) {
        return res.status(404).json({ 
          error: "User not found and could not be created" 
        });
      }
      
      // Return appropriate response based on profile type
      let profileType = 'standard';
      if (newUser.isPermanent) profileType = 'permanent';
      else if (newUser.isTemporary) profileType = 'temporary';
      else if (newUser.isCustom) profileType = 'custom';
      
      return res.json({
        ...newUser,
        profileType,
        isLinked: newUser.goatedAccountLinked || false,
        isNewlyCreated: true
      });
    } catch (sqlError) {
      console.error("Error processing Goated ID request:", sqlError);
      return res.status(500).json({ error: "Database error when fetching user" });
    }
  } catch (error) {
    console.error("Error getting user by Goated ID:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
});

// Production endpoints only - test endpoints removed

export default router;