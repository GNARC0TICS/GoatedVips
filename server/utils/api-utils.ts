import { getApiHeaders } from './api-token';
import { API_CONFIG } from '../config/api';

/**
 * Utility functions for interacting with the Goated.com API
 * Uses the secure token handling from api-token.ts
 */

/**
 * Fetches leaderboard data from the Goated.com API
 * 
 * @returns {Promise<any>} API response data
 * @throws {Error} If API request fails
 */
export async function fetchLeaderboardData() {
  try {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`,
      { headers: getApiHeaders() }
    );
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    throw new Error(`Failed to fetch leaderboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Searches for a user by their Goated ID in the leaderboard data
 * 
 * @param {string} goatedId - The Goated user ID to search for
 * @returns {Promise<any|null>} User data if found, null otherwise
 */
export async function findUserByGoatedId(goatedId: string) {
  try {
    const leaderboardData = await fetchLeaderboardData();
    
    // Search for the user in different time periods
    const timeframes = ['today', 'weekly', 'monthly', 'all_time'];
    
    for (const timeframe of timeframes) {
      const users = leaderboardData?.data?.[timeframe]?.data || [];
      
      // Find the user with the matching UID
      const foundUser = users.find((user: any) => user.uid === goatedId);
      
      if (foundUser) {
        return foundUser;
      }
    }
    
    return null; // User not found in any timeframe
  } catch (error) {
    console.error(`Error finding user by Goated ID ${goatedId}:`, error);
    return null;
  }
}

/**
 * Transforms raw API leaderboard data into a standardized format
 * 
 * @param {any} apiData - Raw API response data
 * @returns {Object} Transformed and sorted leaderboard data
 */
export function transformLeaderboardData(apiData: any) {
  // Extract data from various possible API response formats
  const responseData = apiData.data || apiData.results || apiData;
  
  // Get the array of entries (depends on API response structure)
  const dataArray = Array.isArray(responseData) 
    ? responseData 
    : responseData.entries || [];
  
  // Transform each entry to our standard format
  const transformedData = dataArray.map((entry: any) => ({
    uid: entry.uid || "",
    name: entry.name || "",
    wagered: {
      today: entry.wagered?.today || 0,
      this_week: entry.wagered?.this_week || 0,
      this_month: entry.wagered?.this_month || 0,
      all_time: entry.wagered?.all_time || 0,
    },
  }));
  
  // Helper function to sort by wagered amount for a specific period
  function sortByWagered(data: any[], period: string) {
    return [...data].sort(
      (a, b) => (b.wagered[period] || 0) - (a.wagered[period] || 0)
    );
  }

  // Return the data structured by time periods
  return {
    status: "success",
    metadata: {
      totalUsers: transformedData.length,
      lastUpdated: new Date().toISOString(),
    },
    data: {
      today: { data: sortByWagered(transformedData, "today") },
      weekly: { data: sortByWagered(transformedData, "this_week") },
      monthly: { data: sortByWagered(transformedData, "this_month") },
      all_time: { data: sortByWagered(transformedData, "all_time") },
    },
  };
}