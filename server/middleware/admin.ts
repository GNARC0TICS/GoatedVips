import { Request, Response, NextFunction } from "express";

// Export admin credentials from environment variables
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

/**
 * Middleware to check if a user is an admin
 * Used to protect admin routes
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session) {
      return res.status(401).json({ error: "No session available" });
    }

    // Check admin flag in session
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Initialize admin credentials
 * Should be called during server startup
 */
export async function initializeAdmin() {
  // Verify all required admin credentials are present
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_KEY) {
    console.warn(
      "⚠️ Admin credentials not properly configured. " +
      "Set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SECRET_KEY " +
      "environment variables for secure admin access."
    );
    return false;
  }

  console.log("✅ Admin credentials configured successfully");
  return true;
}

// Extend express-session with our custom admin properties
declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}