import { API_CONFIG } from "../config/api";

/**
 * Utility functions for secure handling of Goated.com API tokens
 * 
 * These utilities ensure consistent, secure handling of API tokens
 * throughout the application. The token must be manually retrieved 
 * from Goated.com and stored as an environment variable.
 */

// Default API token to use as a fallback (update when needed)
export const DEFAULT_API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJNZ2xjTU9DNEl6cWpVbzVhTXFBVyIsInNlc3Npb24iOiIxazVqRkNtdlcxQk0iLCJpYXQiOjE3NDM0OTM1ODksImV4cCI6MTc0MzU3OTk4OX0.l0YfA34QPzdNqwL0GNZ3oJK9LQNKoJn0cNQOA0u8TZs";

/**
 * Retrieves the API token from environment variables or falls back to default token
 * 
 * @returns {string} The API token for Goated.com API
 */
export function getApiToken(): string {
  const token = process.env.API_TOKEN || DEFAULT_API_TOKEN;
  
  if (!token) {
    console.error("API token not configured - must be manually retrieved from goated.com");
    throw new Error("API_TOKEN environment variable or default token is required");
  }
  
  return token;
}

/**
 * Creates properly formatted authorization headers for API requests
 * 
 * @returns {HeadersInit} Headers object with Authorization and Content-Type
 */
export function getApiHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getApiToken()}`,
    "Content-Type": "application/json",
  };
}

/**
 * Validates the current API token by making a simple health check request
 * 
 * @returns {Promise<boolean>} True if token is valid, false otherwise
 */
export async function validateApiToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`, {
      headers: getApiHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.error("API token validation failed:", error);
    return false;
  }
}
