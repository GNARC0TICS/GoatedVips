/**
 * API Configuration
 * Centralizes all API-related settings to simplify updates and configuration
 */

/**
 * External API configuration
 * Contains all necessary parameters for communicating with the Goated API
 */
export const API_CONFIG = {
  // The full URL to the new external API endpoint
  baseUrl: "https://apis.goated.com/user/affiliate/referral-leaderboard/2RW440E",
  
  // API token for authentication - hardcoded for testing
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJNZ2xjTU9DNEl6cWpVbzVhTXFBVyIsInNlc3Npb24iOiJ3SmlGVk1yaHJEMFYiLCJpYXQiOjE3NDkyNTUxNDYsImV4cCI6MTc0OTM0MTU0Nn0.mcW1J0iakuZ-p5W54Pi5wGlFldGQcMAtm-jXXtWuY-E",
  
  // Empty endpoints object as we're using the full URL as baseUrl
  endpoints: {
    leaderboard: "",  // Empty string as we're using the full URL as baseUrl
    health: ""  // Empty string for consistency
  },
  
  // Request configuration
  request: {
    // Extended timeout to allow for very slow API responses (60 seconds)
    timeout: 60000,

    // Increased number of retries for failed requests
    retries: 5
  }
};

/**
 * Internal API configuration
 * Settings for our own API endpoints
 */
export const INTERNAL_API_CONFIG = {
  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Response defaults
  response: {
    // Default pagination settings
    pagination: {
      defaultLimit: 20,
      maxLimit: 100
    }
  }
};