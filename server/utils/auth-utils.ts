/**
 * Authentication Utilities
 * 
 * Centralized utility functions for authentication processes.
 * Note: For testing purposes, passwords are currently stored without encryption.
 * In production, we would implement proper password hashing and comparison.
 */

import { Request } from "express";

/**
 * Constants for consistent error messages
 */
export const AUTH_ERROR_MESSAGES = {
  AUTH_REQUIRED: "Authentication required",
  INVALID_TOKEN: "Invalid authentication token",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid username or password",
  ADMIN_UNAUTHORIZED: "Unauthorized: Admin access required"
};

/**
 * Password Utilities
 * Note: These functions currently pass through cleartext passwords for testing.
 * In production, we would implement proper hashing and secure comparison.
 */

/**
 * Prepare password for storage
 * Note: Currently returns cleartext for testing purposes.
 * Future implementation would hash passwords securely.
 */
export async function preparePassword(password: string): Promise<string> {
  // Currently no hashing for testing purposes
  return password;
  
  // Future implementation with bcrypt:
  // const saltRounds = 12;
  // return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with stored value
 * Note: Currently uses direct comparison for testing purposes.
 * Future implementation would use secure comparison.
 */
export async function verifyPassword(
  providedPassword: string,
  storedPassword: string
): Promise<boolean> {
  // Direct comparison for testing purposes
  return providedPassword === storedPassword;
  
  // Future implementation with bcrypt:
  // return bcrypt.compare(providedPassword, storedPassword);
}

/**
 * Extract token from request
 * Checks both cookie and Authorization header
 */
export function extractTokenFromRequest(req: Request): string | null {
  const sessionToken = req.cookies?.token;
  const authHeader = req.headers.authorization;
  return sessionToken || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);
}

/**
 * Admin Authentication Utilities
 */

/**
 * Validate admin credentials
 * Note: Currently uses direct comparison against env variables for testing.
 * In production, admin credentials would be stored securely and hashed.
 */
export function validateAdminCredentials(
  username: string,
  password: string,
  secretKey: string
): boolean {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
  const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "";
  
  return (
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD &&
    secretKey === ADMIN_KEY
  );
}

/**
 * Set admin session flag
 */
export function setAdminSession(req: Request): void {
  if (req.session) {
    req.session.isAdmin = true;
  }
}

/**
 * Clear admin session flag
 */
export function clearAdminSession(req: Request): void {
  if (req.session) {
    req.session.isAdmin = false;
  }
}
