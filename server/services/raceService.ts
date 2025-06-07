/**
 * RaceService
 * 
 * Handles all wager race operations including:
 * - Current and previous race data management
 * - User position tracking within races
 * - Race completion and historical data storage
 * - Prize distribution calculations
 * 
 * This service is focused specifically on race logic and delegates 
 * leaderboard data fetching to platformApiService.
 */

import { db } from '../../db';
import { leaderboardUsers } from '../../db/schema';
import { desc } from 'drizzle-orm';

class RaceService {
  /**
   * Get current wager race data - simple and direct
   */
  async getCurrentRace() {
    try {
      console.log("RaceService: Fetching current race data from database");
      
      // Get top 10 users by monthly wager
      const topUsers = await db.select()
        .from(leaderboardUsers)
        .orderBy(desc(leaderboardUsers.wager_month))
        .limit(10);

      console.log(`RaceService: Found ${topUsers.length} top users`);
      
      // Simple race data structure
      const participants = topUsers.map((user, index) => ({
        uid: user.uid,
        name: user.name,
        wagered: {
          today: parseFloat(user.wager_today || "0"),
          this_week: parseFloat(user.wager_week || "0"), 
          this_month: parseFloat(user.wager_month || "0"),
          all_time: parseFloat(user.wager_all_time || "0"),
        },
        rank: index + 1
      }));

      // Current month race config
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      return {
        id: `race-${now.getFullYear()}-${now.getMonth() + 1}`,
        name: `${startOfMonth.toLocaleString('default', { month: 'long' })} ${now.getFullYear()} Wager Race`,
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        duration: Math.ceil((endOfMonth.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)),
        status: 'live' as const,
        participants
      };
      
    } catch (error) {
      console.error("RaceService: Error fetching current race:", error);
      throw error;
    }
  }
  
  /**
   * Get user's position in current race
   */
  async getUserRacePosition(uid: string) {
    try {
      // Get all users ordered by monthly wager
      const allUsers = await db.select()
        .from(leaderboardUsers)
        .orderBy(desc(leaderboardUsers.wager_month));

      const userIndex = allUsers.findIndex(user => user.uid === uid);
      
      if (userIndex === -1) {
        return {
          position: null,
          isInTop10: false,
          wageredThisRace: 0,
          raceRemaining: this.getRaceTimeRemaining(),
        };
      }

      const position = userIndex + 1;
      const userWagered = parseFloat(allUsers[userIndex].wager_month || "0");
      
      return {
        position,
        isInTop10: position <= 10,
        wageredThisRace: userWagered,
        raceRemaining: this.getRaceTimeRemaining(),
      };
    } catch (error) {
      console.error(`RaceService: Error getting position for ${uid}:`, error);
      throw error;
    }
  }
  
  /**
   * Get previous race data (simplified)
   */
  async getPreviousRace() {
    // For now, return a simple previous month structure
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    return {
      id: `race-${now.getFullYear()}-${now.getMonth()}`,
      name: `${prevMonth.toLocaleString('default', { month: 'long' })} ${now.getFullYear()} Wager Race`,
      startDate: prevMonth.toISOString(),
      endDate: endPrevMonth.toISOString(),
      duration: Math.ceil((endPrevMonth.getTime() - prevMonth.getTime()) / (1000 * 60 * 60 * 24)),
      status: 'completed' as const,
      participants: []
    };
  }
  
  /**
   * Calculate time remaining in current month (in seconds)
   */
  private getRaceTimeRemaining(): number {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const remaining = Math.max(0, Math.floor((endOfMonth.getTime() - now.getTime()) / 1000));
    return remaining;
  }
}

export default new RaceService(); 