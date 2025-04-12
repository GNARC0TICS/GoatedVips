import { Request, Response, NextFunction } from "express";
import "express-session";
import { validateAdminCredentials, AUTH_ERROR_MESSAGES } from "../utils/auth-utils";

// Add type augmentation for express-session
declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}

/**
 * Middleware to verify admin authentication
 * Ensures requests come from authenticated admin sessions
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ 
      status: "error",
      message: AUTH_ERROR_MESSAGES.ADMIN_UNAUTHORIZED 
    });
  }
};

// Export the utility functions from the centralized location
export { validateAdminCredentials };
