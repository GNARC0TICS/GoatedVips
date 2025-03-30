
export const API_CONFIG = {
  baseUrl: "https://api.goated.com/user2",
  token: process.env.API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJNZ2xjTU9DNEl6cWpVbzVhTXFBVyIsInNlc3Npb24iOiJwaVJKVGs4NHp4SVIiLCJpYXQiOjE3NDMyOTY4NDksImV4cCI6MTc0MzM4MzI0OX0.KiIq4FHDL0ZIrbRTdJQMO3as0dRFjalpJLiPbC2ka0U",
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
