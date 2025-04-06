/**
 * Utilities for transforming and processing leaderboard data
 * Handles data normalization, validation, and transformation for display
 */

import { log } from './logger';

type LeaderboardPeriod = 'today' | 'weekly' | 'monthly' | 'all_time';

interface LeaderboardDataUser {
  uid: string;
  name: string;
  wagered: {
    today?: number;
    this_week?: number;
    this_month?: number;
    all_time?: number;
  };
  [key: string]: any;
}

interface LeaderboardData {
  status: 'success' | 'error';
  metadata?: {
    totalUsers: number;
    lastUpdated: string;
  };
  data: {
    today: { data: LeaderboardDataUser[] };
    weekly: { data: LeaderboardDataUser[] };
    monthly: { data: LeaderboardDataUser[] };
    all_time: { data: LeaderboardDataUser[] };
  };
}

/**
 * Transform raw API leaderboard data into a standardized format
 * 
 * @param apiData - Raw data from the leaderboard API
 * @returns Transformed leaderboard data in standardized format
 */
export async function transformLeaderboardData(apiData: any): Promise<LeaderboardData> {
  const startTime = Date.now();
  
  try {
    log("Starting leaderboard data transformation");
    
    // Default empty response structure
    const defaultResponse: LeaderboardData = {
      status: 'success',
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
    };
    
    // Handle missing or invalid data
    if (!apiData) {
      log("No API data received", "warn");
      return {
        ...defaultResponse,
        status: 'error'
      };
    }
    
    const sourceData = Array.isArray(apiData) 
      ? apiData 
      : Array.isArray(apiData.results) 
        ? apiData.results 
        : Array.isArray(apiData.data) 
          ? apiData.data 
          : null;
    
    if (!sourceData) {
      log("No valid data array found in API response", "warn");
      return {
        ...defaultResponse,
        status: 'error'
      };
    }
    
    // Map the entries by period
    const byPeriod: Record<LeaderboardPeriod, LeaderboardDataUser[]> = {
      today: [],
      weekly: [],
      monthly: [],
      all_time: []
    };
    
    // Group users by period and transform data
    for (const entry of sourceData) {
      if (!entry.uid || !entry.name) continue;
      
      const transformedUser: LeaderboardDataUser = {
        uid: String(entry.uid),
        name: entry.name,
        wagered: {
          today: parseFloat(entry.wagered?.today || 0),
          this_week: parseFloat(entry.wagered?.this_week || 0),
          this_month: parseFloat(entry.wagered?.this_month || 0),
          all_time: parseFloat(entry.wagered?.all_time || 0)
        }
      };
      
      // Add to each period's data if they have wagered for that period
      if ((transformedUser.wagered.today || 0) > 0) {
        byPeriod.today.push(transformedUser);
      }
      
      if ((transformedUser.wagered.this_week || 0) > 0) {
        byPeriod.weekly.push(transformedUser);
      }
      
      if ((transformedUser.wagered.this_month || 0) > 0) {
        byPeriod.monthly.push(transformedUser);
      }
      
      if ((transformedUser.wagered.all_time || 0) > 0) {
        byPeriod.all_time.push(transformedUser);
      }
    }
    
    // Sort each period by appropriate wagered amount
    byPeriod.today.sort((a, b) => (b.wagered.today || 0) - (a.wagered.today || 0));
    byPeriod.weekly.sort((a, b) => (b.wagered.this_week || 0) - (a.wagered.this_week || 0));
    byPeriod.monthly.sort((a, b) => (b.wagered.this_month || 0) - (a.wagered.this_month || 0));
    byPeriod.all_time.sort((a, b) => (b.wagered.all_time || 0) - (a.wagered.all_time || 0));
    
    // Construct the final response with metadata
    const response: LeaderboardData = {
      status: 'success',
      metadata: {
        totalUsers: sourceData.length,
        lastUpdated: new Date().toISOString()
      },
      data: {
        today: { data: byPeriod.today },
        weekly: { data: byPeriod.weekly },
        monthly: { data: byPeriod.monthly },
        all_time: { data: byPeriod.all_time }
      }
    };
    
    const duration = Date.now() - startTime;
    log(`Completed leaderboard transformation in ${duration}ms, found ${sourceData.length} users`);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`Error transforming leaderboard data (${duration}ms): ${error instanceof Error ? error.message : String(error)}`, "error");
    
    // Return empty but valid data structure
    return {
      status: 'error',
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
    };
  }
}