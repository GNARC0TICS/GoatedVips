/**
 * API Configuration
 * Centralizes all API-related settings to simplify updates and configuration
 */

/**
 * External API configuration
 * Contains all necessary parameters for communicating with the Goated API
 */
export const API_CONFIG = {
  // Base URL for all API requests
  baseUrl: process.env.API_BASE_URL || 'https://api.goated.com/api/v1',
  
  // API token used for authentication with the external service
  // Retrieved from environment variables
  token: process.env.API_TOKEN || '',
  
  // Endpoints organized by function
  endpoints: {
    // User-related endpoints
    users: '/users',
    profile: '/profile',
    
    // Leaderboard/stats endpoints
    leaderboard: '/leaderboard',
    statistics: '/statistics',
    
    // Game data endpoints
    games: '/games',
    outcomes: '/outcomes',
    wagers: '/wagers',
    
    // Bonus/promotion endpoints
    bonuses: '/bonuses',
    promotions: '/promotions',
  },
  
  // Request configuration
  request: {
    // Default timeout in milliseconds
    timeout: 10000,
    
    // Default number of retries for failed requests
    retries: 3,
    
    // Cache TTL in seconds for different endpoint types
    cacheTtl: {
      leaderboard: 300, // 5 minutes
      users: 600,       // 10 minutes
      statistics: 900,  // 15 minutes
      games: 1800,      // 30 minutes
    }
  },
  
  // Response mappings
  // Maps API response fields to our application's field names
  fieldMappings: {
    userId: 'uid',
    username: 'name',
    totalWagered: 'total_wagered',
    totalWon: 'total_won',
    gamesPlayed: 'games_played',
    winRate: 'win_rate'
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