/**
 * API configuration for Goated.com integration
 * Defines endpoints and fallback data structures
 * 
 * NOTE: API token is no longer stored here. It's now managed through
 * environment variables and accessed via the api-token.ts utility.
 */
export const API_CONFIG = {
  baseUrl: "https://api.goated.com/user2",
  endpoints: {
    leaderboard: "/affiliate/referral-leaderboard/2RW440E",
    health: "/health"
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
  }
};
