/**
 * Authentication Service
 * 
 * Centralizes authentication logic for the server.
 * This service:
 * 1. Handles JWT token generation and verification
 * 2. Manages user authentication state
 * 3. Provides helper functions for authentication
 * 4. Centralizes security configurations
 * 
 * Using this service instead of scattered logic helps maintain
 * consistent authentication behavior across the API.
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { users } from "@db/schema";

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";
const JWT_EXPIRES_IN = "7d";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

// Validation schemas
export const jwtPayloadSchema = z.object({
  userId: z.number(),
  email: z.string().email(),
  isAdmin: z.boolean(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

/**
 * Generate an authentication token
 * 
 * @param payload Data to encode in the token
 * @returns JWT token string
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate a refresh token with longer expiration
 * 
 * @param payload Data to encode in the token
 * @returns Refresh token string
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 * 
 * @param token JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = jwtPayloadSchema.safeParse(decoded);
    if (!result.success) {
      throw new Error("Invalid token payload");
    }
    return result.data;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

/**
 * Hash a password using bcrypt
 * 
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with a hash
 * 
 * @param providedPassword Plain text password to check
 * @param storedHash Stored password hash
 * @returns true if password matches, false otherwise
 */
export async function comparePasswords(
  providedPassword: string,
  storedHash: string
): Promise<boolean> {
  return bcrypt.compare(providedPassword, storedHash);
}

/**
 * Validate admin credentials
 * 
 * @param username Username to validate
 * @param password Password to validate
 * @param secretKey Admin secret key to validate
 * @returns true if credentials are valid, false otherwise
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
 * Get a user by their ID
 * 
 * @param userId User ID to lookup
 * @returns User object if found, null otherwise
 */
export async function getUserById(userId: number) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user || null;
}

/**
 * Get a user by their email
 * 
 * @param email Email to lookup
 * @returns User object if found, null otherwise
 */
export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return user || null;
}

/**
 * Get a user by their username
 * 
 * @param username Username to lookup
 * @returns User object if found, null otherwise
 */
export async function getUserByUsername(username: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  
  return user || null;
}

/**
 * Generate error responses for authentication failures
 */
export const AUTH_ERRORS = {
  UNAUTHORIZED: { message: "Authentication required", status: 401 },
  INVALID_TOKEN: { message: "Invalid authentication token", status: 401 },
  USER_NOT_FOUND: { message: "User not found", status: 404 },
  INVALID_CREDENTIALS: { message: "Invalid credentials", status: 401 },
  ACCESS_DENIED: { message: "Access denied", status: 403 },
  ACCOUNT_LOCKED: { message: "Account locked", status: 403 },
};
