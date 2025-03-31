
/**
 * Utility function to modify Ruffrollr777's wager amount
 * This can be run directly from the command line to increase their position
 */
import { db } from "@db";
import { mockWagerData } from "@db/schema";
import { eq, sql } from "drizzle-orm";

async function modifyRuffrollrWager() {
  try {
    console.log("Starting Ruffrollr777 wager modification...");
    
    // Username to modify
    const username = "Ruffrollr777";
    
    // First, check current leaderboard to see standings
    const response = await fetch(
      `http://localhost:5000/api/affiliate/stats`
    );
    
    const leaderboard = await response.json();
    const monthlyData = leaderboard?.data?.monthly?.data || [];
    
    if (monthlyData.length === 0) {
      console.log("No monthly data found in leaderboard. Aborting.");
      return;
    }
    
    // Find current position of Ruffrollr777
    const currentPosition = monthlyData.findIndex((entry: any) => 
      entry.name.toLowerCase() === username.toLowerCase()
    );
    
    if (currentPosition === -1) {
      console.log(`${username} not found in leaderboard. Creating new mock data.`);
      return;
    }
    
    console.log(`${username} is currently in position ${currentPosition + 1}`);
    
    // If they're already in 3rd place or higher, no need to modify
    if (currentPosition <= 2) {
      console.log(`${username} is already in ${currentPosition + 1}st place. No modification needed.`);
      return;
    }
    
    // Target 3rd place
    const targetPosition = 2; // 0-indexed, so 2 is 3rd place
    
    // Get the wager amount of the person currently in 3rd place
    const thirdPlaceWager = monthlyData[targetPosition]?.wagered?.this_month || 0;
    console.log(`Current 3rd place has a monthly wager of: $${thirdPlaceWager}`);
    
    // We'll set Ruffrollr's wager to be slightly higher than current 3rd place
    const newWagerAmount = thirdPlaceWager + 50; // $50 more to surpass them
    
    // Check if user already has mock data
    const existingData = await db.select()
      .from(mockWagerData)
      .where(eq(mockWagerData.username, username))
      .limit(1);
    
    if (existingData.length > 0) {
      // Update existing record
      await db.update(mockWagerData)
        .set({
          wageredThisMonth: newWagerAmount,
          updatedAt: new Date()
        })
        .where(eq(mockWagerData.username, username));
      
      console.log(`Updated ${username}'s monthly wager to $${newWagerAmount}`);
    } else {
      // Create new mock data record
      await db.insert(mockWagerData).values({
        username,
        wageredToday: 0,
        wageredThisWeek: 0,
        wageredThisMonth: newWagerAmount,
        wageredAllTime: newWagerAmount,
        isMocked: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Created new mock wager data for ${username} with monthly wager of $${newWagerAmount}`);
    }
    
    console.log("Wager modification complete. Refresh the leaderboard to see the change.");
  } catch (error) {
    console.error("Error modifying wager:", error);
  }
}

// Execute the function when this file is run directly
if (require.main === module) {
  modifyRuffrollrWager()
    .then(() => console.log("Done"))
    .catch(console.error);
}

export { modifyRuffrollrWager };
