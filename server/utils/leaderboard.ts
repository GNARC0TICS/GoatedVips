/**
 * Utility for handling leaderboard data transformations
 * This centralizes our data modification logic in one place
 */

import { boostRuffrollrWager } from './modify-ruffrollr';
import { applyWagerOverrides } from './apply-wager-overrides';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

/**
 * Processes raw API data to be transformed into our standardized format
 * Also applies any necessary data modifications (like Ruffrollr777 boosting and admin overrides)
 * @param rawData - Raw data from the API
 * @returns Modified and processed data
 */
export async function processLeaderboardData(rawData: any): Promise<any> {
  try {
    // First, apply the boost to Ruffrollr777's wager amount
    const ruffrollrBoosted = boostRuffrollrWager(rawData);
    
    // Then apply any admin wager overrides stored in the database
    const withOverrides = await applyWagerOverrides(ruffrollrBoosted);
    
    // Transform into our standardized format
    return transformLeaderboardData(withOverrides);
  } catch (error) {
    console.error('Error in processLeaderboardData:', error);
    // If there's an error, return the original data transformed without modifications
    return transformLeaderboardData(rawData);
  }
}

// We now use the exported applyWagerOverrides utility from './apply-wager-overrides'

/**
 * Transforms leaderboard data into standardized format
 * @param apiData - Data to transform (possibly already modified)
 * @returns Transformed data object
 */
export function transformLeaderboardData(apiData: any) {
  const data = apiData.data || apiData.results || apiData;
  if (!Array.isArray(data)) {
    return {
      status: "success",
      metadata: {
        totalUsers: 0,
        lastUpdated: new Date().toISOString(),
      },
      data: {
        today: { data: [] },
        weekly: { data: [] },
        monthly: { data: [] },
        all_time: { data: [] },
      },
    };
  }

  // Ensure all records have proper wagered structure before sorting
  const processedData = data.map(entry => ({
    ...entry,
    wagered: {
      today: Number(entry.wagered?.today || 0),
      this_week: Number(entry.wagered?.this_week || 0),
      this_month: Number(entry.wagered?.this_month || 0),
      all_time: Number(entry.wagered?.all_time || 0)
    }
  }));

  // Sort the data for each time period
  const todayData = [...processedData].sort((a, b) => b.wagered.today - a.wagered.today);
  const weeklyData = [...processedData].sort((a, b) => b.wagered.this_week - a.wagered.this_week);
  const monthlyData = [...processedData].sort((a, b) => b.wagered.this_month - a.wagered.this_month);
  const allTimeData = [...processedData].sort((a, b) => b.wagered.all_time - a.wagered.all_time);

  // Log the top 5 positions in the monthly leaderboard
  console.log('Top 5 monthly leaderboard positions:');
  monthlyData.slice(0, 5).forEach((entry, index) => {
    console.log(`${index + 1}. ${entry.name}: $${entry.wagered.this_month.toLocaleString()}`);
  });

  // Check if Ruffrollr777 is in the top positions
  const ruffrollrPosition = monthlyData.findIndex(entry => 
    entry.name === 'Ruffrollr777' || 
    entry.name.toLowerCase() === 'ruffrollr777'
  );
  
  if (ruffrollrPosition !== -1) {
    console.log(`Ruffrollr777 is at position ${ruffrollrPosition + 1} in the monthly leaderboard`);
    // If Ruffrollr777 is not yet in the top 3, additional boosting might be needed
    if (ruffrollrPosition > 2) {
      console.log(`Ruffrollr777 needs additional boosting to reach top 3 (currently at position ${ruffrollrPosition + 1})`);
    }
  }

  return {
    status: "success",
    metadata: {
      totalUsers: data.length,
      lastUpdated: new Date().toISOString(),
    },
    data: {
      today: { data: todayData },
      weekly: { data: weeklyData },
      monthly: { data: monthlyData },
      all_time: { data: allTimeData },
    },
  };
}