/**
 * Utility script to boost "Ruffrollr777" wager amount by 44,000 
 * This script modifies the leaderboard data after it's received from the API
 * but before it's transformed and sent to clients
 */

interface LeaderboardEntry {
  uid: string;
  name: string;
  wagered: {
    today: number;
    this_week: number;
    this_month: number;
    all_time: number;
  };
}

interface APIData {
  data?: any[];
  results?: any[];
}

/**
 * Modifies leaderboard data to boost Ruffrollr777's wager amount 
 * to ensure 3rd place position in monthly leaderboard
 * @param apiData - The original API data
 * @returns Modified API data with boosted wager amounts
 */
export function boostRuffrollrWager(apiData: APIData): APIData {
  // Extract the data from the nested structure
  const dataArray = apiData.data || apiData.results || [];
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    console.log('No data array found to modify');
    return apiData;
  }

  // Create a copy to avoid modifying the original array
  const modifiedData = [...dataArray];
  
  // Look for Ruffrollr777 in the leaderboard data
  const ruffrollrIndex = modifiedData.findIndex(entry => 
    entry.name === 'Ruffrollr777' || 
    entry.name.toLowerCase() === 'ruffrollr777'
  );

  if (ruffrollrIndex === -1) {
    console.log('User Ruffrollr777 not found in leaderboard data');
    return apiData;
  }

  // Get the Ruffrollr777 entry
  const ruffrollrEntry = modifiedData[ruffrollrIndex];
  const currentWager = ruffrollrEntry.wagered?.this_month || 0;
  
  // Sort data by monthly wager to find positions
  const sortedByMonthly = [...modifiedData].sort((a, b) => {
    const bValue = Number(b.wagered?.this_month || 0);
    const aValue = Number(a.wagered?.this_month || 0);
    return bValue - aValue;
  });
  
  // Find the wager amount needed for 3rd place
  // Target position 3 (index 2, 0-indexed)
  let targetPosition = 2; // Index 2 is the 3rd position (0-indexed)
  
  // If there aren't enough entries, use what we have
  if (sortedByMonthly.length <= targetPosition) {
    targetPosition = Math.max(0, sortedByMonthly.length - 1);
  } else if (sortedByMonthly.length < 5) {
    // If we don't have at least 5 entries, we'll need to be careful with the positioning
    console.log(`Only ${sortedByMonthly.length} entries in leaderboard - will place at position ${targetPosition + 1}`);
  }
  
  // Get the wager of the user currently in the target position
  const targetWager = Number(sortedByMonthly[targetPosition]?.wagered?.this_month || 0);
  
  // Check current Ruffrollr777 position
  const currentPosition = sortedByMonthly.findIndex(entry => 
    entry.name === 'Ruffrollr777' || 
    entry.name.toLowerCase() === 'ruffrollr777'
  );
  
  // Set a more realistic boost amount - targeting 3rd place exactly
  const baseBoost = 5; // Minimal starting boost
  let boostAmount = baseBoost;
  
  // If not in 3rd place, calculate boost needed
  if (currentPosition > targetPosition) {
    // Find the values of the users at positions 2, 3, and 4
    const position2Wager = Number(sortedByMonthly[1]?.wagered?.this_month || 0);
    const position3Wager = Number(sortedByMonthly[2]?.wagered?.this_month || 0);
    const position4Wager = currentPosition >= 4 ? Number(sortedByMonthly[3]?.wagered?.this_month || 0) : 0;
    
    // Calculate the boost needed to be precisely at 3rd position
    // We want to be just above position 4 but below position 2
    if (currentWager < position3Wager) {
      // Need to surpass current 3rd place
      boostAmount = (position3Wager - currentWager) + 0.01; // Just barely above position 3
    } else if (currentPosition > 3) {
      // Already have higher wager than position 3, but still not in position 3
      // This is a special case - let's place them between positions 2 and 4
      boostAmount = Math.max(
        (position4Wager - currentWager) + ((position2Wager - position4Wager) * 0.5),
        baseBoost
      );
    }
    
    // Cap the boost at a realistic maximum amount
    const maxBoost = 10; // Maximum reasonable boost
    boostAmount = Math.min(boostAmount, maxBoost);
  }
  
  // Apply the calculated boost
  ruffrollrEntry.wagered = {
    today: (ruffrollrEntry.wagered?.today || 0) + boostAmount,
    this_week: (ruffrollrEntry.wagered?.this_week || 0) + boostAmount,
    this_month: (ruffrollrEntry.wagered?.this_month || 0) + boostAmount, 
    all_time: (ruffrollrEntry.wagered?.all_time || 0) + boostAmount
  };

  console.log(`Boosted Ruffrollr777 wager by ${boostAmount.toLocaleString()}:`, ruffrollrEntry.wagered);
  console.log(`Current position: ${currentPosition + 1}, Target position: ${targetPosition + 1}`);
  
  // Update the array with the modified entry
  modifiedData[ruffrollrIndex] = ruffrollrEntry;
  
  // Final position check
  const finalSorted = [...modifiedData].sort((a, b) => {
    const bValue = Number(b.wagered?.this_month || 0);
    const aValue = Number(a.wagered?.this_month || 0);
    return bValue - aValue;
  });
  
  const finalPosition = finalSorted.findIndex(entry => 
    entry.name === 'Ruffrollr777' || 
    entry.name.toLowerCase() === 'ruffrollr777'
  );
  
  console.log(`Ruffrollr777 final position: ${finalPosition + 1}`);
  
  // Log the top positions after boosting
  console.log("Monthly leaderboard top positions after boost:");
  finalSorted.slice(0, 5).forEach((entry, idx) => {
    console.log(`${idx + 1}. ${entry.name}: $${Number(entry.wagered?.this_month).toLocaleString()}`);
  });
  
  // Return the modified data in the same structure
  if (apiData.data) {
    return { ...apiData, data: modifiedData };
  } else if (apiData.results) {
    return { ...apiData, results: modifiedData };
  } else {
    return { data: modifiedData };
  }
}