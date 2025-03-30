import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
export const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "";

/**
 * Middleware to verify admin authentication
 * Ensures requests from authenticated admin sessions
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Admin access required" });
  }
};

/**
 * Validate credentials against environment variables
 * Used for admin login authentication
 */
export const validateAdminCredentials = (
  username: string,
  password: string,
  secretKey: string
): boolean => {
  return (
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD &&
    secretKey === ADMIN_KEY
  );
};

// Prepare hashed passwords for production use
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(
  providedPassword: string,
  storedHash: string
): Promise<boolean> {
  return bcrypt.compare(providedPassword, storedHash);
}