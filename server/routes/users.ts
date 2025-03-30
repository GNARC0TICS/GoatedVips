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

// Type definitions for missing properties
type IpHistoryEntry = { ip: string; timestamp: Date; };
type LoginHistoryEntry = { timestamp: Date; success: boolean; ip?: string; };
type ActivityLogEntry = { action: string; timestamp: Date; details?: any; };

// Extended user type with optional fields we might need
interface ExtendedUser extends SelectUser {
  // Basic fields from schema.ts
  bio?: string;
  profileColor?: string;
  goatedId?: string;
  goatedUsername?: string;
  goatedAccountLinked?: boolean;
  lastActive?: Date;
  telegramUsername?: string;
  
  // Extended fields
  telegramVerifiedAt?: Date;
  lastLoginIp?: string;
  registrationIp?: string;
  country?: string;
  city?: string;
  ipHistory?: IpHistoryEntry[];
  loginHistory?: LoginHistoryEntry[];
  activityLogs?: ActivityLogEntry[];
  suspiciousActivity?: boolean;
  updatedAt?: Date;
  
  // Security fields that might be added later
  twoFactorEnabled?: boolean;
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
        // Only include sensitive data for admin view
        ...(isAdminView && {
          // Telegram related fields
          telegramId: extUser.telegramId,
          telegramVerifiedAt: extUser.telegramVerifiedAt,
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

// Authentication routes 
router.post("/login", loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        // Implement login logic here, including secure password handling
        // and potentially using JWT for authentication.
        const user = await authenticateUser(username, password); // Placeholder function
        if (user) {
            // Generate and send JWT or other authentication token
            const token = generateToken(user); // Placeholder function
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Profile image handling route
router.post('/api/profile/image', upload.single('image'), async (req, res) => {
    //Handle profile image upload.  Requires multer or similar middleware
    try {
        // Save image to storage (e.g., cloudinary, local storage)
        const imageUrl = await saveProfileImage(req.file); // Placeholder function
        res.json({ imageUrl });
    } catch (error) {
        console.error("Image upload error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User preferences route
router.put('/api/profile/preferences', async (req, res) => {
    try {
        const { preferences } = req.body;
        // Update user preferences in the database
        await updateUserPreferences(req.user.id, preferences); // Placeholder function
        res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
        console.error("Preference update error:", error);
        res.status(500).json({ error: 'Server error' });
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
    if (isNumericId) {
      // For numeric IDs, try using raw SQL to avoid type conversion issues
      const numericId = parseInt(id, 10);
      console.log(`Parsed numeric ID: ${numericId}`);
      try {
        console.log(`Executing SQL query for numeric ID ${numericId}`);
        const results = await db.execute(sql`
          SELECT 
            id, 
            username, 
            bio, 
            profile_color as "profileColor", 
            created_at as "createdAt", 
            goated_id as "goatedId"
          FROM users 
          WHERE id = ${numericId}
          LIMIT 1
        `);
        console.log(`Query results:`, results);
        // Extract the user from the first row of results
        user = results.rows && results.rows.length > 0 ? results.rows[0] : null;
        console.log("Extracted user:", user);
      } catch (findError) {
        console.log("Error finding user by numeric ID:", findError);
        user = null;
      }
      
      // If no user found with numeric ID, try to see if this is a Goated ID
      if (!user) {
        try {
          // Try to fetch this user's data from the external API
          const API_TOKEN = process.env.API_TOKEN;
          if (API_TOKEN) {
            // Attempt to find this user in the wager races API
            const response = await fetch(
              `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.player}/${numericId}`,
              {
                headers: {
                  Authorization: `Bearer ${API_TOKEN}`,
                  "Content-Type": "application/json",
                }
              }
            );
            
            if (response.ok) {
              const playerData = await response.json();
              if (playerData && playerData.uid && playerData.name) {
                // Found a player - create a profile for them
                const userId = uuidv4();
                const email = `${playerData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@goated.placeholder.com`;
                
                await db.execute(sql`
                  INSERT INTO users (
                    id, username, email, password, created_at, updated_at, profile_color, bio, is_admin, goated_id
                  ) VALUES (
                    ${userId}, ${playerData.name}, ${email}, '', ${new Date()}, ${new Date()}, '#D7FF00', '', false, ${playerData.uid}
                  )
                `);
                
                // Now return the newly created user
                user = {
                  id: userId,
                  username: playerData.name,
                  bio: '',
                  profileColor: '#D7FF00',
                  createdAt: new Date(),
                  goatedId: playerData.uid
                };
              }
            }
          }
        } catch (apiError) {
          console.error("Error creating user from API:", apiError);
          // Continue - we'll return 404 if we can't create the user
        }
      }
    } else {
      // For string IDs (UUID format), use raw SQL to avoid type conversion issues
      try {
        const results = await db.execute(sql`
          SELECT 
            id, 
            username, 
            bio, 
            profile_color as "profileColor", 
            created_at as "createdAt", 
            goated_id as "goatedId"
          FROM users 
          WHERE id = ${id}
          LIMIT 1
        `);
        console.log(`String ID query results:`, results);
        // Extract the user from the first row of results
        user = results.rows && results.rows.length > 0 ? results.rows[0] : null;
        console.log("Extracted user from string ID:", user);
      } catch (findError) {
        console.log("Error finding user by string ID:", findError);
        user = null;
      }
    }
    
    if (!user) {
      // If user is not found, return 404
      return res.status(404).json({
        error: "User not found",
      });
    }
    
    // Return user data
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
    
    // Check if id is numeric or a string ID
    const isNumericId = /^\d+$/.test(id);
    
    // Check if user exists based on ID type using raw SQL to avoid type conversion issues
    let existingUser;
    if (isNumericId) {
      // For numeric IDs
      try {
        const numericId = parseInt(id, 10);
        const results = await db.execute(sql`
          SELECT id FROM users WHERE id = ${numericId} LIMIT 1
        `);
        console.log(`Numeric ID profile update check results:`, results);
        existingUser = results.rows && results.rows.length > 0 ? results.rows[0] : null;
      } catch (findError) {
        console.log("Error finding user by numeric ID for update:", findError);
        existingUser = null;
      }
    } else {
      // For string IDs
      try {
        const results = await db.execute(sql`
          SELECT id FROM users WHERE id = ${id} LIMIT 1
        `);
        console.log(`String ID profile update check results:`, results);
        existingUser = results.rows && results.rows.length > 0 ? results.rows[0] : null;
      } catch (findError) {
        console.log("Error finding user by string ID for update:", findError);
        existingUser = null;
      }
    }
    
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update user profile using raw SQL to avoid type conversion issues
    if (isNumericId) {
      const numericId = parseInt(id, 10);
      await db.execute(sql`
        UPDATE users 
        SET bio = ${bio}, profile_color = ${profileColor}
        WHERE id = ${numericId}
      `);
    } else {
      await db.execute(sql`
        UPDATE users 
        SET bio = ${bio}, profile_color = ${profileColor}
        WHERE id = ${id}
      `);
    }
    
    res.json({ success: true, message: "Profile updated successfully" });
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




// Placeholder functions (replace with actual implementation)
async function authenticateUser(username: string, password: string): Promise<any> {
    // Implement authentication logic here
    return null; // Replace with user object or null if authentication fails
}

function generateToken(user: any): string | null {
    // Implement JWT token generation or other authentication token generation here
    return null; // Replace with generated token
}

async function saveProfileImage(file: any): Promise<string | null> {
    // Implement image saving logic (e.g., cloudinary, local storage)
    return null; // Replace with image URL
}

async function updateUserPreferences(userId: string | number, preferences: any): Promise<void> {
    // Implement user preference update logic
    return; // Replace with successful operation or error handling
}

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
        errors.push(`Failed to create ${user.username}: ${insertError.message}`);
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
    
    // Process each user from the leaderboard
    for (const player of allTimeData) {
      try {
        // Skip entries without uid or name
        if (!player.uid || !player.name) continue;
        
        // Check if user already exists by goatedId
        const existingUser = await db.select().from(users)
          .where(sql`goated_id = ${player.uid}`)
          .limit(1);
        
        if (existingUser && existingUser.length > 0) {
          existingCount++;
          continue; // Skip existing users
        }
        
        // Create a new profile for this user
        const userId = uuidv4();
        const email = `${player.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@goated.placeholder.com`;
        
        await db.execute(sql`
          INSERT INTO users (
            id, username, email, password, created_at, profile_color, bio, is_admin, goated_id
          ) VALUES (
            ${userId}, ${player.name}, ${email}, '', ${new Date()}, '#D7FF00', '', false, ${player.uid}
          )
        `);
        
        createdCount++;
      } catch (error) {
        console.error(`Error processing user ${player?.name}:`, error);
        errors.push(`Error creating profile for ${player?.name}: ${error.message}`);
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
    
    // Find user by Goated ID using raw SQL to avoid schema issues
    try {
      const results = await db.execute(sql`
        SELECT 
          id, 
          username, 
          bio, 
          profile_color as "profileColor", 
          created_at as "createdAt",
          telegram_username as "telegramUsername",
          goated_id as "goatedId"
        FROM users 
        WHERE goated_id = ${goatedId}
        LIMIT 1
      `);
      
      console.log(`Goated ID query results:`, results);
      // Extract the user from the first row of results
      const user = results.rows && results.rows.length > 0 ? results.rows[0] : null;
      console.log("Extracted user by Goated ID:", user);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (sqlError) {
      console.error("SQL error getting user by Goated ID:", sqlError);
      return res.status(500).json({ error: "Database error when fetching user" });
    }
  } catch (error) {
    console.error("Error getting user by Goated ID:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
});

// Endpoint to create a user profile from ID (numeric or UUID)
router.post("/ensure-profile-from-id", async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required" 
      });
    }
    
    // Check if ID is numeric (potential Goated ID) or UUID format
    const isNumericId = /^\d+$/.test(userId);
    
    // First check if user already exists in our database
    let existingUser;
    
    if (isNumericId) {
      // Check if this is a Goated ID using raw SQL to avoid schema issues
      try {
        const results = await db.execute(sql`
          SELECT id, username FROM users WHERE goated_id = ${userId}::text LIMIT 1
        `);
        console.log(`Goated ID search for user existence:`, results);
        existingUser = results.rows && results.rows.length > 0 ? results.rows[0] : null;
      } catch (findError) {
        console.log("Error finding user by Goated ID:", findError);
        existingUser = null;
      }
    } else {
      // Check by string ID (UUID format) using raw SQL to avoid type conversion issues
      try {
        const results = await db.execute(sql`
          SELECT id, username FROM users WHERE id::text = ${userId}
          LIMIT 1
        `);
        console.log(`String ID search for user existence:`, results);
        existingUser = results.rows && results.rows.length > 0 ? results.rows[0] : null;
      } catch (findError) {
        console.log("Error finding user by string ID:", findError);
        existingUser = null;
      }
    }
    
    // If user exists, return success
    if (existingUser) {
      return res.json({
        success: true,
        message: "User profile already exists",
        id: existingUser.id,
        username: existingUser.username
      });
    }
    
    // If user doesn't exist and ID is numeric, try to fetch from the Goated API
    if (isNumericId) {
      try {
        const API_TOKEN = process.env.API_TOKEN;
        
        if (!API_TOKEN) {
          return res.status(500).json({
            error: "API_TOKEN is not configured"
          });
        }
        
        // Attempt to get user data from Goated API
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.player}/${userId}`, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const playerData = await response.json();
          
          if (playerData && playerData.uid && playerData.name) {
            // Create a profile for this user
            const newUserId = Math.floor(1000 + Math.random() * 9000); // Generate a random numeric ID
            const email = `${playerData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@goated.placeholder.com`;
            
            // Use raw SQL to insert the new user
            await db.execute(sql`
              INSERT INTO users (
                id, username, email, password, created_at, profile_color, bio, is_admin, goated_id
              ) VALUES (
                ${newUserId}, ${playerData.name}, ${email}, '', ${new Date()}, '#D7FF00', '', false, ${playerData.uid}
              )
            `);
            
            return res.json({
              success: true,
              message: "User profile created from Goated API",
              id: newUserId,
              username: playerData.name
            });
          }
        }
        
        // If we get here, the user doesn't exist in Goated API either
        return res.status(404).json({
          error: "User not found in our system or Goated API"
        });
      } catch (apiError) {
        console.error("Error creating user from API:", apiError);
        return res.status(500).json({
          error: "Failed to fetch user data from API"
        });
      }
    }
    
    // If non-numeric ID, just return not found
    return res.status(404).json({
      error: "User not found with provided ID"
    });
  } catch (error) {
    console.error("Error ensuring user profile from ID:", error);
    res.status(500).json({ error: "Failed to process user profile request" });
  }
});

export default router;