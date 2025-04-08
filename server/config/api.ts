/**
 * API Configuration
 * Centralizes all API-related settings to simplify updates and configuration
 */

/**
 * External API configuration
 * Contains all necessary parameters for communicating with the Goated API
 */
export const API_CONFIG = {
  // The full URL to the external API endpoint
  baseUrl: "https://api.goated.com/user2/affiliate/referral-leaderboard/2RW440E",
  
  // API token for authentication - only use environment variable
  token: process.env.GOATED_API_TOKEN || process.env.API_TOKEN || "",
  
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