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

import { db } from "@db";
import { 
  wagerRaces, 
  wagerRaceParticipants, 
  transformationLogs,
  users,
  SelectWagerRace,
  SelectWagerRaceParticipant
} from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { cacheService } from "./cacheService";
import statSyncService from "./statSyncService";

// LeaderboardData interface - TODO: Move to shared types file
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

interface LeaderboardData {
  status: "success" | "error";
  metadata: {
    totalUsers: number;
    lastUpdated: string;
  };
  data: {
    today: { data: LeaderboardEntry[] };
    weekly: { data: LeaderboardEntry[] };
    monthly: { data: LeaderboardEntry[] };
    all_time: { data: LeaderboardEntry[] };
  };
}

/**
 * RaceData represents the wager race information
 * This is the data structure returned by our race endpoints
 */
export interface RaceData {
  id: string;
  status: "live" | "ended" | "upcoming";
  startDate: string;
  endDate: string;
  prizePool: number;
  participants: {
    uid: string;
    name: string;
    wagered: number;
    position: number;
  }[];
  totalWagered: number;
  participantCount: number;
  metadata: {
    transitionEnds: string;
    nextRaceStarts: string;
    prizeDistribution: number[];
  };
}

/**
 * RacePositionData represents a user's position in the current race
 */
export interface RacePositionData {
  position: number | null;
  totalParticipants: number;
  wagerAmount: number;
  previousPosition: number | null;
  raceType: string;
  raceTitle: string;
  endDate: string;
}

/**
 * RaceConfig represents the configuration for a race
 */
export interface RaceConfig {
  prizePool: number;
  prizeDistribution: Record<string, number>;
  type: "monthly" | "weekly" | "weekend";
  title: string;
}

// Add fallback config util
const fallbackRaceConfig = {
  prizePool: 500,
  prizeDistribution: {
    "1": 0.425,
    "2": 0.2,
    "3": 0.15,
    "4": 0.075,
    "5": 0.06,
    "6": 0.04,
    "7": 0.0275,
    "8": 0.0225,
    "9": 0.0175,
    "10": 0.0175
  },
  type: "monthly",
  title: "Monthly Wager Race"
};

export class RaceService {
  
  /**
   * Get current wager race data
   * Used by the /api/wager-races/current endpoint
   */
  async getCurrentRace(leaderboardData: LeaderboardData): Promise<RaceData> {
    const startTime = Date.now();
    console.log("RaceService: Fetching current race data");
    
    try {
      // Fetch current race from DB (status: 'live')
      let dbRace = await db.query.wagerRaces.findFirst({
        where: eq(wagerRaces.status, 'live'),
        orderBy: sql`${wagerRaces.startDate} DESC`,
      });
      // Fallback to 'upcoming' if no live race
      if (!dbRace) {
        dbRace = await db.query.wagerRaces.findFirst({
          where: eq(wagerRaces.status, 'upcoming'),
          orderBy: sql`${wagerRaces.startDate} DESC`,
        });
      }
      // Use fallback config if no race found
      const config = dbRace ? {
        prizePool: Number(dbRace.prizePool),
        prizeDistribution: dbRace.prizeDistribution || fallbackRaceConfig.prizeDistribution,
        type: dbRace.type,
        title: dbRace.title || dbRace.name || fallbackRaceConfig.title,
        startDate: dbRace.startDate,
        endDate: dbRace.endDate,
        id: dbRace.id,
      } : {
        ...fallbackRaceConfig,
        startDate: new Date(),
        endDate: new Date(),
        id: 'fallback',
      };
      // Transform leaderboard data to race format using DB config
      const raceData = this.transformToRaceData(leaderboardData, config);
      
      // Save race completion data if race is ending
      await this.saveCompletedRaceData(config.id, leaderboardData.data.monthly.data, config);
      
      // Log successful transformation
      await this.logRaceOperation('current-race', 'success', 
        `Transformed current race data with ${raceData.participants.length} participants`, 
        Date.now() - startTime);
      
      return raceData;
    } catch (error) {
      // Log transformation error
      await this.logRaceOperation('current-race', 'error', 
        `Failed to transform current race data: ${error instanceof Error ? error.message : String(error)}`, 
        Date.now() - startTime, 
        error instanceof Error ? error.message : String(error));
      
      throw error;
    }
  }
  
  /**
   * Get previous wager race data
   * Used by the /api/wager-races/previous endpoint
   */
  async getPreviousRace(): Promise<RaceData> {
    const startTime = Date.now();
    console.log("RaceService: Fetching previous race data");
    
    try {
      // Check if we have historical race data in the database
      const previousRace = await this.getLastCompletedRace();
      
      if (previousRace) {
        // Return historical data from database
        const raceData = await this.buildRaceDataFromDB(previousRace);
        
        await this.logRaceOperation('previous-race', 'success', 
          `Retrieved previous race data from database with ${raceData.participants.length} participants`, 
          Date.now() - startTime);
        
        return raceData;
      } else {
        // Fallback to simulated previous race data
        const simulatedRaceData = await this.getSimulatedPreviousRace();
        
        await this.logRaceOperation('previous-race', 'success', 
          `Generated simulated previous race data with ${simulatedRaceData.participants.length} participants`, 
          Date.now() - startTime);
        
        return simulatedRaceData;
      }
    } catch (error) {
      await this.logRaceOperation('previous-race', 'error', 
        `Failed to fetch previous race data: ${error instanceof Error ? error.message : String(error)}`, 
        Date.now() - startTime, 
        error instanceof Error ? error.message : String(error));
      
      throw error;
    }
  }
  
  /**
   * Get user's position in the current race
   * Used by the /api/wager-race/position endpoint
   */
  async getUserRacePosition(uid: string, leaderboardData: LeaderboardData): Promise<RacePositionData> {
    console.log(`RaceService: Getting race position for user ${uid}`);
    try {
      // Use tie-aware ranking
      const monthlyRanked = statSyncService.sortByWagered(leaderboardData.data.monthly.data, "this_month");
      const userIndex = monthlyRanked.findIndex(user => user.uid === uid);
      const raceConfig = this.getCurrentRaceConfig();
      if (userIndex === -1) {
        console.log(`User ${uid} not found in monthly data`);
        return {
          position: null,
          totalParticipants: monthlyRanked.length,
          wagerAmount: 0,
          previousPosition: null,
          raceType: 'monthly',
          raceTitle: raceConfig.title,
          endDate: this.getCurrentRaceEndDate().toISOString()
        };
      }
      const userData = monthlyRanked[userIndex];
      // Try to fetch previousPosition from DB
      let previousPosition: number | null = null;
      const user = await db.query.users.findFirst({ where: sql`goated_id = ${uid}` });
      if (user) {
        const lastRace = await this.getLastCompletedRace();
        if (lastRace) {
          const prevParticipant = await db.query.wagerRaceParticipants.findFirst({
            where: sql`race_id = ${lastRace.id} AND user_id = ${user.id}`
          });
          if (prevParticipant && typeof prevParticipant.previousPosition === 'number') {
            previousPosition = prevParticipant.previousPosition;
          } else if (prevParticipant && typeof prevParticipant.position === 'number') {
            previousPosition = prevParticipant.position;
          }
        }
      }
      return {
        position: userData.rank,
        totalParticipants: monthlyRanked.length,
        wagerAmount: userData.wagered.this_month,
        previousPosition,
        raceType: 'monthly',
        raceTitle: raceConfig.title,
        endDate: this.getCurrentRaceEndDate().toISOString()
      };
    } catch (error) {
      console.error(`RaceService: Error getting race position for user ${uid}:`, error);
      throw error;
    }
  }
  
  /**
   * Get race by ID from database
   */
  async getRaceById(raceId: number): Promise<SelectWagerRace | null> {
    try {
      const race = await db.query.wagerRaces.findFirst({
        where: eq(wagerRaces.id, raceId),
      });
      
      return race || null;
    } catch (error) {
      console.error(`RaceService: Error fetching race ${raceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all participants for a race
   */
  async getRaceParticipants(raceId: number): Promise<SelectWagerRaceParticipant[]> {
    try {
      const participants = await db.query.wagerRaceParticipants.findMany({
        where: eq(wagerRaceParticipants.raceId, raceId),
      });
      
      return participants;
    } catch (error) {
      console.error(`RaceService: Error fetching participants for race ${raceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new race
   */
  async createRace(config: RaceConfig & { 
    startDate: Date; 
    endDate: Date; 
    name?: string;
    description?: string;
  }): Promise<number> {
    try {
      const result = await db.insert(wagerRaces).values({
        title: config.title,
        name: config.name || `${config.type}-${Date.now()}`,
        type: config.type,
        status: 'upcoming',
        prizePool: String(config.prizePool),
        startDate: config.startDate,
        endDate: config.endDate,
        prizeDistribution: config.prizeDistribution,
        description: config.description,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning({ id: wagerRaces.id });
      
      const raceId = result[0]?.id;
      if (!raceId) {
        throw new Error("Failed to create race record");
      }
      
      console.log(`RaceService: Created new race with ID ${raceId}`);
      return raceId;
    } catch (error) {
      console.error("RaceService: Error creating race:", error);
      throw error;
    }
  }
  
  /**
   * Update race status
   */
  async updateRaceStatus(raceId: number, status: 'upcoming' | 'live' | 'completed'): Promise<void> {
    try {
      await db.update(wagerRaces)
        .set({
          status,
          ...(status === 'completed' && { completedAt: new Date() }),
          updatedAt: new Date()
        })
        .where(eq(wagerRaces.id, raceId));
      
      console.log(`RaceService: Updated race ${raceId} status to ${status}`);
    } catch (error) {
      console.error(`RaceService: Error updating race ${raceId} status:`, error);
      throw error;
    }
  }
  
  // Private helper methods
  
  /**
   * Transforms leaderboard data into race format
   * Now takes config from DB
   */
  private transformToRaceData(leaderboardData: LeaderboardData, config: any): RaceData {
    console.log("RaceService: Transforming leaderboard data to race format");
    const now = new Date();
    const raceId = config.id?.toString() || `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    // Use tie-aware ranking
    const monthlyRanked = statSyncService.sortByWagered(leaderboardData.data.monthly.data, "this_month");
    const totalWagered = monthlyRanked.reduce((sum, p) => sum + p.wagered.this_month, 0);
    return {
      id: raceId,
      status: 'live',
      startDate: config.startDate?.toISOString?.() || now.toISOString(),
      endDate: config.endDate?.toISOString?.() || now.toISOString(),
      prizePool: config.prizePool,
      participants: monthlyRanked
        .map((participant) => ({
          uid: participant.uid,
          name: participant.name,
          wagered: participant.wagered.this_month,
          position: participant.rank
        }))
        .slice(0, 10),
      totalWagered,
      participantCount: monthlyRanked.length,
      metadata: {
        transitionEnds: config.endDate ? new Date(config.endDate.getTime() + 24 * 60 * 60 * 1000).toISOString() : '',
        nextRaceStarts: config.endDate ? new Date(config.endDate.getTime() + 24 * 60 * 60 * 1000).toISOString() : '',
        prizeDistribution: Object.values(config.prizeDistribution)
      }
    };
  }
  
  /**
   * Get the last completed race from database
   */
  private async getLastCompletedRace(): Promise<SelectWagerRace | null> {
    try {
      const lastRace = await db.query.wagerRaces.findFirst({
        where: eq(wagerRaces.status, 'ended'),
        orderBy: sql`${wagerRaces.endDate} DESC`,
      });
      
      return lastRace || null;
    } catch (error) {
      console.error("RaceService: Error fetching last completed race:", error);
      return null;
    }
  }
  
  /**
   * Build race data from database record
   */
  private async buildRaceDataFromDB(race: SelectWagerRace): Promise<RaceData> {
    const participants = await this.getRaceParticipants(race.id);
    
    return {
      id: race.name || race.id.toString(),
      status: race.status as "live" | "ended" | "upcoming",
      startDate: race.startDate.toISOString(),
      endDate: race.endDate.toISOString(),
      prizePool: Number(race.prizePool),
      participants: participants
        .sort((a, b) => a.position - b.position)
        .map(p => ({
          uid: p.userId?.toString() || '',
          name: p.username,
          wagered: Number(p.wagered),
          position: p.position
        })),
      totalWagered: participants.reduce((sum, p) => sum + Number(p.wagered), 0),
      participantCount: participants.length,
      metadata: {
        transitionEnds: new Date(race.endDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        nextRaceStarts: new Date(race.endDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        prizeDistribution: Object.values(race.prizeDistribution as Record<string, number>)
      }
    };
  }
  
  /**
   * Generate simulated previous race data (fallback)
   */
  private async getSimulatedPreviousRace(): Promise<RaceData> {
    // For April 2025, the previous race would be for March 2025
    const previousMonth = new Date(2025, 2, 1); // March 1, 2025
    const endOfPreviousMonth = new Date(2025, 3, 0); // March 31, 2025
    const raceId = `${previousMonth.getFullYear()}${(previousMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // TODO: Fetch actual historical data instead of simulating
    // This is a temporary fallback for when no historical data exists
    const simulatedParticipants = [
      { uid: "sim1", name: "Player1", wagered: 15000, position: 1 },
      { uid: "sim2", name: "Player2", wagered: 12000, position: 2 },
      { uid: "sim3", name: "Player3", wagered: 8000, position: 3 },
      { uid: "sim4", name: "Player4", wagered: 6000, position: 4 },
      { uid: "sim5", name: "Player5", wagered: 4000, position: 5 }
    ];
    
    const totalWagered = simulatedParticipants.reduce((sum, p) => sum + p.wagered, 0);
    const raceConfig = this.getCurrentRaceConfig();
    
    return {
      id: raceId,
      status: 'ended',
      startDate: previousMonth.toISOString(),
      endDate: endOfPreviousMonth.toISOString(),
      prizePool: raceConfig.prizePool,
      participants: simulatedParticipants,
      totalWagered,
      participantCount: simulatedParticipants.length,
      metadata: {
        transitionEnds: new Date(2025, 3, 2).toISOString(), // April 2, 2025
        nextRaceStarts: new Date(2025, 3, 1).toISOString(), // April 1, 2025
        prizeDistribution: Object.values(raceConfig.prizeDistribution)
      }
    };
  }
  
  /**
   * Save completed race data to the database
   * Now logs full config into metadata
   */
  private async saveCompletedRaceData(raceId: string, monthlyData: LeaderboardEntry[], config: any): Promise<void> {
    try {
      console.log(`RaceService: Saving completed race data for race ${raceId}`);
      const existingRace = await db.query.wagerRaces.findFirst({
        where: sql`id = ${raceId} OR name = ${raceId}`,
      });
      if (existingRace) {
        if (existingRace.status !== 'ended') {
          await this.updateRaceStatus(existingRace.id, 'completed');
        }
        await this.updateRaceParticipants(existingRace.id, monthlyData, config);
      } else {
        await this.createCompletedRace(raceId, monthlyData, config);
      }
      // Invalidate caches after race completion
      cacheService.invalidate("current_race");
      cacheService.invalidate("previous_race");
      cacheService.invalidate("leaderboard_top_performers");
    } catch (error) {
      console.error(`RaceService: Error saving completed race data for race ${raceId}:`, error);
    }
  }
  
  /**
   * Update participants for an existing race
   * Now uses config from DB
   */
  private async updateRaceParticipants(raceId: number, monthlyData: LeaderboardEntry[], config: any): Promise<void> {
    const existingParticipants = await this.getRaceParticipants(raceId);
    const race = await this.getRaceById(raceId);
    if (!race) return;
    // Use tie-aware ranking
    const ranked = statSyncService.sortByWagered(monthlyData, "this_month");
    // Fetch previous snapshot for previousPosition
    const prevSnapshot: Record<string, number> = {};
    for (const p of existingParticipants) {
      if (p.userId) prevSnapshot[p.userId.toString()] = p.position;
    }
    const top10 = ranked.slice(0, 10);
    for (const participant of top10) {
      const user = await db.query.users.findFirst({
        where: sql`goated_id = ${participant.uid}`,
      });
      const existingParticipant = existingParticipants.find(p =>
        user ? p.userId === user.id : p.username === participant.name
      );
      const prizeAmount = this.calculatePrizeAmount(
        participant.rank,
        Number(config.prizePool),
        config.prizeDistribution
      );
      const previousPosition = user && prevSnapshot[user.id?.toString()] ? prevSnapshot[user.id.toString()] : null;
      if (existingParticipant) {
        await db.update(wagerRaceParticipants)
          .set({
            position: participant.rank,
            previousPosition,
            wagered: String(participant.wagered),
            prizeAmount: String(prizeAmount),
            updatedAt: new Date()
          })
          .where(eq(wagerRaceParticipants.id, existingParticipant.id));
      } else {
        await db.insert(wagerRaceParticipants).values({
          raceId: raceId,
          userId: user?.id,
          username: participant.name,
          wagered: String(participant.wagered),
          position: participant.rank,
          previousPosition,
          prizeAmount: String(prizeAmount),
          joinedAt: new Date(),
          updatedAt: new Date()
        });
      }
      console.log(`RaceService: Updated/added participant ${participant.name} for race ${raceId}`);
    }
    // Invalidate relevant cache keys after participant update
    cacheService.invalidate("current_race");
    cacheService.invalidate("previous_race");
    cacheService.invalidate("leaderboard_top_performers");
  }
  
  /**
   * Create a new completed race with participants
   * Now uses config from DB
   */
  private async createCompletedRace(raceId: string, monthlyData: LeaderboardEntry[], config: any): Promise<void> {
    const result = await db.insert(wagerRaces).values({
      title: config.title,
      name: raceId,
      type: config.type,
      status: 'ended',
      prizePool: String(config.prizePool),
      startDate: config.startDate,
      endDate: config.endDate,
      prizeDistribution: config.prizeDistribution,
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning({ id: wagerRaces.id });
    const newRaceId = result[0]?.id;
    if (newRaceId) {
      console.log(`RaceService: Created new race record with ID ${newRaceId}`);
      await this.updateRaceParticipants(newRaceId, monthlyData, config);
    } else {
      console.error(`RaceService: Failed to create race record for ${raceId}`);
    }
  }
  
  /**
   * Calculate prize amount for a given position
   * Now always uses config from DB
   */
  private calculatePrizeAmount(
    position: number,
    prizePool: number,
    prizeDistribution: Record<string, number>
  ): number {
    const percentage = prizeDistribution[position.toString()] || 0;
    return prizePool * percentage;
  }
  
  /**
   * Get current race configuration
   * TODO: Move to database configuration instead of hardcoded values
   */
  private getCurrentRaceConfig(): RaceConfig {
    return {
      prizePool: 500,
      prizeDistribution: {
        "1": 0.425,
        "2": 0.2,
        "3": 0.15,
        "4": 0.075,
        "5": 0.06,
        "6": 0.04,
        "7": 0.0275,
        "8": 0.0225,
        "9": 0.0175,
        "10": 0.0175
      },
      type: "monthly",
      title: "Monthly Wager Race"
    };
  }
  
  /**
   * Get current race end date
   * TODO: Make this dynamic based on race configuration
   */
  private getCurrentRaceEndDate(): Date {
    // End of current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }
  
  /**
   * Log race-related operations
   */
  private async logRaceOperation(
    type: string, 
    status: 'success' | 'error' | 'warning' | 'info', 
    message: string, 
    durationMs: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      await db.insert(transformationLogs).values({
        type: status,
        message: `[race-${type}] ${message}`,
        duration_ms: String(durationMs),
        created_at: new Date(),
        resolved: status !== 'error',
        error_message: errorMessage
      });
    } catch (error) {
      console.error("RaceService: Failed to log operation:", error);
    }
  }
}

// Export singleton instance
export const raceService = new RaceService();

// Default export for consistency
export default raceService; 