import { Router } from "express";
import { db } from "@db";
import { users } from "@db/schema";
import type { SelectUser } from "@db/schema";
import { like, desc, eq } from "drizzle-orm";
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import type { IpHistoryEntry, LoginHistoryEntry, ActivityLogEntry } from "@db/schema/users";

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
      .orderBy(desc(users.lastActive))
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
    
    // Fetch user 
    const user = await db.query.users.findFirst({
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
    
    if (!user) {
      // If user is not found, return placeholder data structure
      // but with appropriate status code
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
    
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { id: true }
    });
    
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update user profile
    await db
      .update(users)
      .set({
        bio,
        profileColor,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    
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


export default router;