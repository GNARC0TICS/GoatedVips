import { Router } from "express";
import { db } from "@db";
import { users } from "@db/schema";
import type { SelectUser } from "@db/schema";
import { like, desc, eq, sql } from "drizzle-orm";
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import type { IpHistoryEntry, LoginHistoryEntry, ActivityLogEntry } from "@db/schema/users";
import { API_CONFIG } from "../config/api";

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
  const { username } = req.query;
  const isAdminView = req.headers['x-admin-view'] === 'true';

  if (typeof username !== "string" || username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }

  try {
    const results = await db
      .select()
      .from(users)
      .where(like(users.username, `%${username}%`))
      .limit(10);

    // Map results based on admin view access
    const mappedResults = results.map((user: SelectUser) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      // Only include sensitive data for admin view
      ...(isAdminView && {
        // Telegram related fields
        telegramId: user.telegramId,
        telegramVerifiedAt: user.telegramVerifiedAt,
        // Location and activity fields
        lastLoginIp: user.lastLoginIp,
        registrationIp: user.registrationIp,
        country: user.country,
        city: user.city,
        lastActive: user.lastActive,
        // Analytics fields
        ipHistory: (user.ipHistory || []) as IpHistoryEntry[],
        loginHistory: (user.loginHistory || []) as LoginHistoryEntry[],
        // Security fields
        twoFactorEnabled: user.twoFactorEnabled,
        suspiciousActivity: user.suspiciousActivity,
        activityLogs: (user.activityLogs || []) as ActivityLogEntry[]
      })
    }));

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
    
    // Check if id is numeric or a string ID
    const isNumericId = /^\d+$/.test(id);
    
    // Fetch user based on ID type
    let user;
    if (isNumericId) {
      // For numeric IDs, use eq with parsed integer
      const numericId = parseInt(id, 10);
      // First try to find the user
      user = await db.query.users.findFirst({
        where: eq(users.id, numericId),
        columns: {
          // Only include non-sensitive information
          id: true,
          username: true,
          bio: true,
          profileColor: true,
          createdAt: true,
          telegramUsername: true,
          goatedId: true,
          // Explicitly exclude sensitive fields
          password: false,
          email: false,
          lastLoginIp: false,
          registrationIp: false,
          ipHistory: false,
          loginHistory: false
        }
      });
      
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
      // For string IDs like UUID, keep as string
      user = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: {
          // Only include non-sensitive information
          id: true,
          username: true,
          bio: true,
          profileColor: true,
          createdAt: true,
          telegramUsername: true,
          goatedId: true,
          // Explicitly exclude sensitive fields
          password: false,
          email: false,
          lastLoginIp: false,
          registrationIp: false,
          ipHistory: false,
          loginHistory: false
        }
      });
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
    
    // Check if user exists based on ID type
    let existingUser;
    if (isNumericId) {
      // For numeric IDs
      existingUser = await db.query.users.findFirst({
        where: eq(users.id, parseInt(id, 10)),
        columns: { id: true }
      });
    } else {
      // For string IDs
      existingUser = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: { id: true }
      });
    }
    
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update user profile based on ID type
    if (isNumericId) {
      await db
        .update(users)
        .set({
          bio,
          profileColor,
          updatedAt: new Date()
        })
        .where(eq(users.id, parseInt(id, 10)));
    } else {
      await db
        .update(users)
        .set({
          bio,
          profileColor,
          updatedAt: new Date()
        })
        .where(eq(users.id, id));
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
    
    // If user doesn't exist, create a new profile
    const userId = uuidv4();
    await db.insert(users).values({
      id: userId,
      username,
      email,
      password: '', // empty password since this is just for profile viewing
      createdAt: new Date(),
      updatedAt: new Date(),
      profileColor: '#D7FF00', // Default color
      bio: '',
      isAdmin: false
    });
    
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
async function authenticateUser(username, password) {
    // Implement authentication logic here
    return null; // Replace with user object or null if authentication fails
}

function generateToken(user) {
    // Implement JWT token generation or other authentication token generation here
    return null; // Replace with generated token
}

async function saveProfileImage(file) {
    // Implement image saving logic (e.g., cloudinary, local storage)
    return null; // Replace with image URL
}

async function updateUserPreferences(userId, preferences) {
    // Implement user preference update logic
    return null; // Replace with successful operation or error handling
}

function getVerificationEmailTemplate(verificationCode) {
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
        
        await db.insert(users).values({
          id: randomId,
          username: user.username,
          email: user.email,
          password: hashedPassword,
          profileColor: user.profileColor,
          bio: 'This is a test user account created for development purposes.',
          isAdmin: false,
          createdAt: new Date(),
          emailVerified: true
        });
        
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
            id, username, email, password, created_at, updated_at, profile_color, bio, is_admin, goated_id
          ) VALUES (
            ${userId}, ${player.name}, ${email}, '', ${new Date()}, ${new Date()}, '#D7FF00', '', false, ${player.uid}
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
    
    // Find user by Goated ID
    const user = await db.query.users.findFirst({
      where: eq(users.goatedId, goatedId),
      columns: {
        id: true,
        username: true,
        bio: true,
        profileColor: true,
        createdAt: true,
        telegramUsername: true,
        goatedId: true,
        // Explicitly exclude sensitive fields
        password: false,
        email: false
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
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
      // Check if this is a Goated ID
      existingUser = await db.query.users.findFirst({
        where: eq(users.goatedId, userId),
        columns: { id: true, username: true }
      });
    } else {
      // Check by UUID
      existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { id: true, username: true }
      });
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
            
            // Use db.insert to properly handle the schema fields
            await db.insert(users).values({
              id: newUserId,
              username: playerData.name,
              email: email,
              password: '', // Empty password for view-only profiles
              createdAt: new Date(),
              updatedAt: new Date(),
              profileColor: '#D7FF00',
              bio: '',
              isAdmin: false,
              goatedId: playerData.uid
            });
            
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