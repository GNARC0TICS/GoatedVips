/**
 * Authentication Utilities
 * 
 * Centralized utility functions for authentication processes.
 * 
 * This file provides authentication-related functionality including token handling,
 * password management, and admin authentication.
 */

import { Request } from "express";
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import * as crypto from "crypto";
import { isFeatureEnabled } from "@/config/feature-flags";

/**
 * Constants for consistent error messages
 */
export const AUTH_ERROR_MESSAGES = {
  AUTH_REQUIRED: "Authentication required",
  INVALID_TOKEN: "Invalid authentication token",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid username or password",
  ADMIN_UNAUTHORIZED: "Unauthorized: Admin access required",
  TOKEN_MISSING: "Authentication token is missing",
  TOKEN_EXPIRED: "Authentication token has expired",
  SESSION_EXPIRED: "Your session has expired. Please log in again",
  PERMISSION_DENIED: "You do not have permission to access this resource"
};

/**
 * Error response format for authentication errors
 */
export interface AuthError {
  code: number;
  message: string;
  details?: any;
}

/**
 * Create a standardized authentication error
 */
export function createAuthError(code: number, message: string, details?: any): AuthError {
  return {
    code,
    message,
    details
  };
}

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
 * Centralized token extraction from request
 * Works with cookies, Authorization header, and query params
 */
export function extractTokenFromRequest(req: Request): string | null {
  // Try from cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  // Try from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try from query parameters (less secure, but sometimes used for debugging)
  if (req.query && req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }
  
  return null;
}

/**
 * Parse token from various formats
 * Handles "Bearer" tokens, raw tokens, and malformed tokens
 */
export function parseToken(rawToken: string): string {
  if (!rawToken) {
    return '';
  }
  
  // If it's a Bearer token, extract the token part
  if (rawToken.startsWith('Bearer ')) {
    return rawToken.substring(7);
  }
  
  return rawToken;
}

/**
 * Generate a JWT token 
 */
export function generateJWT(payload: string | object | Buffer, expiresIn: string = '7d'): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  // Use any type to bypass strict type checking for now
  const options: any = { expiresIn };
  return jwt.sign(payload, secret, options);
}

/**
 * Verify a JWT token
 */
export function verifyJWT(token: string): JwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a secure token for verification, password reset, etc.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
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
  secretKey?: string
): boolean {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
  const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "";
  
  // If secretKey is provided, require it to match
  if (secretKey) {
    return (
      username === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD &&
      secretKey === ADMIN_KEY
    );
  }
  
  // Otherwise just check username and password
  return (
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  );
}

/**
 * Verifies if a request is coming from an admin user
 * Centralizes admin verification to prevent duplication
 */
export function isAdminRequest(req: Request): boolean {
  // Check for admin flag in session
  if (req.session && req.session.isAdmin === true) {
    return true;
  }
  
  // For admin API routes that use direct credential validation
  if (req.body && req.body.username && req.body.password) {
    return validateAdminCredentials(req.body.username, req.body.password);
  }
  
  // Check if user object has admin flag
  if (req.user && (req.user as any).isAdmin) {
    return true;
  }
  
  return false;
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
