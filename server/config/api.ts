export const API_CONFIG = {
  BASE_URL: "https://europe-west2-g3casino.cloudfunctions.net/user",
  token: process.env.API_TOKEN || "",
  endpoints: {
    leaderboard: "/affiliate/referral-leaderboard/2RW440E",
    stats: "/affiliate/stats",
    race: "/affiliate/race",
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