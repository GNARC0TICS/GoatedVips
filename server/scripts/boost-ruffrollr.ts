/**
 * Script to boost Ruffrollr777's wager amount by 44,000
 * 
 * This script demonstrates how the boostRuffrollrWager utility works 
 * by fetching data from the API, modifying it, and showing the before/after
 * comparison
 */

import { boostRuffrollrWager } from '../utils/modify-ruffrollr';
import { API_CONFIG } from '../config/api';

/**
 * Run the script to boost Ruffrollr777's wager
 */
async function main() {
  try {
    console.log("Fetching original leaderboard data...");
    
    // Fetch the data from the API
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const rawData = await response.json();
    console.log(`Fetched ${rawData.data?.length || 0} leaderboard entries`);
    
    // Find Ruffrollr777 before the boost
    const originalData = rawData.data || rawData.results || [];
    const originalRuffrollr = originalData.find(
      (entry: any) => entry.name === 'Ruffrollr777' || entry.name.toLowerCase() === 'ruffrollr777'
    );
    
    // Find original rank
    const originalRank = findRankInLeaderboard(originalData, 'Ruffrollr777', 'this_month');
    
    console.log("\n--- BEFORE BOOST ---");
    console.log(`Ruffrollr777 original position: ${originalRank}`);
    if (originalRuffrollr) {
      console.log("Original wager amounts:");
      console.log(`  Today: $${originalRuffrollr.wagered.today || 0}`);
      console.log(`  This Week: $${originalRuffrollr.wagered.this_week || 0}`);
      console.log(`  This Month: $${originalRuffrollr.wagered.this_month || 0}`);
      console.log(`  All Time: $${originalRuffrollr.wagered.all_time || 0}`);
    } else {
      console.log("Ruffrollr777 not found in original data");
    }
    
    // Log the original top 3 in the monthly leaderboard
    console.log("\nOriginal Top 3 Monthly Leaderboard:");
    const originalMonthly = [...originalData].sort((a, b) => 
      (b.wagered?.this_month || 0) - (a.wagered?.this_month || 0)
    );
    originalMonthly.slice(0, 3).forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.name}: $${entry.wagered?.this_month || 0}`);
    });
    
    // Apply the boost
    console.log("\nApplying boost to Ruffrollr777...");
    const boostedData = boostRuffrollrWager(rawData);
    
    // Find Ruffrollr777 after the boost
    const modifiedData = boostedData.data || boostedData.results || [];
    const boostedRuffrollr = modifiedData.find(
      (entry: any) => entry.name === 'Ruffrollr777' || entry.name.toLowerCase() === 'ruffrollr777'
    );
    
    // Find new rank
    const boostedRank = findRankInLeaderboard(modifiedData, 'Ruffrollr777', 'this_month');
    
    console.log("\n--- AFTER BOOST ---");
    console.log(`Ruffrollr777 new position: ${boostedRank}`);
    if (boostedRuffrollr) {
      console.log("Boosted wager amounts:");
      console.log(`  Today: $${boostedRuffrollr.wagered.today || 0}`);
      console.log(`  This Week: $${boostedRuffrollr.wagered.this_week || 0}`);
      console.log(`  This Month: $${boostedRuffrollr.wagered.this_month || 0}`);
      console.log(`  All Time: $${boostedRuffrollr.wagered.all_time || 0}`);
      
      // Calculate the boost amount
      const boostAmount = (boostedRuffrollr.wagered.this_month || 0) - (originalRuffrollr?.wagered?.this_month || 0);
      console.log(`\nTotal boost applied: $${boostAmount}`);
    } else {
      console.log("Ruffrollr777 not found in boosted data");
    }
    
    // Log the boosted top 3 in the monthly leaderboard
    console.log("\nBoosted Top 3 Monthly Leaderboard:");
    const boostedMonthly = [...modifiedData].sort((a, b) => 
      (b.wagered?.this_month || 0) - (a.wagered?.this_month || 0)
    );
    boostedMonthly.slice(0, 3).forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.name}: $${entry.wagered?.this_month || 0}`);
    });
    
    // Check if the goal of position 3 is achieved
    if (boostedRank === 3) {
      console.log("\n✅ Success! Ruffrollr777 is now at position 3 in the monthly leaderboard");
    } else {
      console.log(`\n❌ Boost goal not achieved. Ruffrollr777 is at position ${boostedRank} instead of 3`);
    }
    
  } catch (error) {
    console.error("Error running boost test script:", error);
  }
}

/**
 * Helper function to find a user's rank in the leaderboard
 */
function findRankInLeaderboard(data: any[], username: string, period: 'today' | 'this_week' | 'this_month' | 'all_time'): number {
  // Sort the data by the specified period's wager amount
  const sorted = [...data].sort((a, b) => (b.wagered?.[period] || 0) - (a.wagered?.[period] || 0));
  
  // Find the index of the user with the specified username
  const index = sorted.findIndex(
    entry => entry.name === username || entry.name.toLowerCase() === username.toLowerCase()
  );
  
  // Return the rank (1-based index)
  return index === -1 ? -1 : index + 1;
}

// Execute the script
main().catch(console.error);