import jwt from "jsonwebtoken";
import { z } from "zod";

/**
 * Schema for JWT payload validation
 * Ensures all JWT tokens contain the required fields
 */
export const jwtPayloadSchema = z.object({
  userId: z.number(),
  email: z.string().email(),
  isAdmin: z.boolean(),
});

/**
 * JWT configuration
 * Used for token generation and validation
 */
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";
const JWT_EXPIRES_IN = "7d";

/**
 * Email configuration for verification emails
 */
export const EMAIL_CONFIG = {
  from: "noreply@goatedvips.com",
  name: "GoatedVIPs Support",
  subject: "Verify Your GoatedVIPs Account"
};

/**
 * Generates a JWT token with the provided payload
 * 
 * @param {Object} payload - Data to include in the token (must match jwtPayloadSchema)
 * @returns {string} Signed JWT token
 */
export const generateToken = (payload: z.infer<typeof jwtPayloadSchema>) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies and decodes a JWT token
 * 
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or payload doesn't match schema
 */
export const verifyToken = (token: string) => {
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
};
