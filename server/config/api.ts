/**
 * API Configuration
 * Centralizes all API-related settings to simplify updates and configuration
 */

/**
 * External API configuration
 * Contains all necessary parameters for communicating with the Goated API
 */
export const API_CONFIG = {
  baseUrl: "https://api.goated.com/user2",
  token: process.env.API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJNZ2xjTU9DNEl6cWpVbzVhTXFBVyIsInNlc3Npb24iOiJUWlNlWlJVWkFZbzEiLCJpYXQiOjE3NDM5MTM3NzYsImV4cCI6MTc0NDAwMDE3Nn0.8JHA2VNfP1FyS4HXIONlKBuDNjS98o8Waxnl6WOXCus",
  endpoints: {
    leaderboard: "/affiliate/referral-leaderboard/2RW440E",
    health: "/health"
    // Removed invalid endpoints
  },
  fallbackData: {
    // Fallback data structure when API is unavailable
    leaderboard: {
      status: "success",
      metadata: {
        totalUsers: 0,
        lastUpdated: new Date().toISOString()
      },
      data: {
        today: { data: [] },
        weekly: { data: [] },
        monthly: { data: [] },
        all_time: { data: [] }
      }
    }
  },
  request: {
    // Default timeout in milliseconds
    timeout: 10000,

    // Default number of retries for failed requests
    retries: 3
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