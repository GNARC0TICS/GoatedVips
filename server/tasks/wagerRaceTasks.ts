/**
 * Wager Race Related Scheduled Tasks
 * 
 * This module handles scheduled tasks related to wager races, including:
 * - Archiving completed races at the end of each month
 * - Snapshotting monthly leaderboard data for historical purposes
 * - Creating new races for the upcoming month
 */

import { db } from "../../db";
import { sql, eq } from "drizzle-orm";
import { wagerRaces, wagerRaceParticipants } from "../../db/schema";
import schedule from "node-schedule";
import { log } from "../utils/logger";
import { API_CONFIG } from "../config/api";
import { transformLeaderboardData } from "../utils/leaderboard";

/**
 * Creates a snapshot of the current wager race and marks it as completed
 * This ensures we have historical data for past races even after API data changes
 */
export async function captureMonthlyRaceSnapshot(): Promise<void> {
  try {
    log("Starting monthly wager race snapshot capture");
    
    // 1. Fetch the current active race
    const [currentRace] = await db
      .select()
      .from(wagerRaces)
      .where(eq(wagerRaces.status, 'live'))
      .orderBy(sql`end_date DESC`)
      .limit(1);
    
    if (!currentRace) {
      log("No active race found to snapshot");
      return;
    }
    
    // 2. Fetch current leaderboard data from API to get final standings
    const token = process.env.API_TOKEN || API_CONFIG.token;
    
    if (!token) {
      log("API token not found, cannot capture race snapshot", "error");
      return;
    }
    
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      log(`API request failed: ${response.status}`, "error");
      return;
    }
    
    const rawData = await response.json();
    const stats = await transformLeaderboardData(rawData);
    
    // 3. Update race status to completed
    await db
      .update(wagerRaces)
      .set({ 
        status: 'completed',
        completedAt: new Date()
      } as any) // Using type assertion to avoid TypeScript error
      .where(eq(wagerRaces.id, currentRace.id));
    
    log(`Updated race ${currentRace.id} status to completed`);
    
    // 4. Store top participants data
    const monthlyData = stats?.data?.monthly?.data || [];
    let participantsAdded = 0;
    
    // Process only top 10 participants
    for (const [index, participant] of monthlyData.slice(0, 10).entries()) {
      if (!participant.uid) continue;
      
      try {
        // Calculate prize amount based on position
        let prizeAmount = 0;
        if (index === 0) prizeAmount = 250; // 1st place
        else if (index === 1) prizeAmount = 150; // 2nd place
        else if (index === 2) prizeAmount = 75; // 3rd place
        else if (index < 10) prizeAmount = 25; // 4th-10th place
        
        // Insert participant record
        await db
          .insert(wagerRaceParticipants)
          .values({
            raceId: currentRace.id,
            userId: parseInt(participant.uid) || 0, // Convert to number ID for internal reference
            username: participant.name || `Player ${participant.uid}`,
            position: index + 1,
            wagered: String(participant?.wagered?.this_month || 0),
            prizeAmount: String(prizeAmount),
            prizeClaimed: false
          } as any)
          .onConflictDoUpdate({
            target: [wagerRaceParticipants.raceId, wagerRaceParticipants.userId],
            set: {
              position: index + 1,
              wagered: String(participant?.wagered?.this_month || 0),
              prizeAmount: String(prizeAmount)
            } as any
          });
        
        participantsAdded++;
      } catch (error) {
        log(`Error adding participant ${participant.uid}: ${error instanceof Error ? error.message : String(error)}`, "error");
      }
    }
    
    log(`Successfully added ${participantsAdded} participants to race ${currentRace.id}`);
    
    // 5. Create a new race for the next month
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0, 23, 59, 59);
    
    const [newRace] = await db
      .insert(wagerRaces)
      .values({
        title: `Monthly Race - ${nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        name: `Monthly Race - ${nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        description: `Compete for the top wagering position in ${nextMonth.toLocaleString('default', { month: 'long' })}!`,
        startDate: nextMonth,
        endDate: endOfNextMonth,
        prizePool: '500',
        status: 'live',
        type: 'monthly'
      } as any)
      .returning();
    
    log(`Created new race for ${nextMonth.toLocaleString('default', { month: 'long' })}: ID ${newRace?.id}`);
    
  } catch (error) {
    log(`Error in captureMonthlyRaceSnapshot: ${error instanceof Error ? error.message : String(error)}`, "error");
  }
}

/**
 * Setup all scheduled tasks related to wager races
 */
export function setupWagerRaceScheduledTasks(): void {
  try {
    // Schedule the task to run on the last day of each month at 23:59
    // Rule: '59 23 L * *' = minute 59, hour 23, last day of month, any month, any day of week
    const task = schedule.scheduleJob('59 23 L * *', async () => {
      log("Running scheduled monthly race snapshot task");
      await captureMonthlyRaceSnapshot();
    });
    
    log(`Scheduled wager race snapshot task: ${task ? 'Success' : 'Failed'}`);
    
    // For testing/debugging - uncomment to run immediately
    // captureMonthlyRaceSnapshot().then(() => log("Initial race snapshot complete")).catch(error => log("Error in initial race snapshot", error));
  } catch (error) {
    log(`Error setting up wager race scheduled tasks: ${error instanceof Error ? error.message : String(error)}`, "error");
  }
}