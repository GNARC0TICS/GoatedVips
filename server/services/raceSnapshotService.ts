import { db } from '@db';
import { raceSnapshots, InsertRaceSnapshot, SelectRaceSnapshot } from '@db/schema'; // Assuming raceSnapshots schema exports these
import { eq, desc } from 'drizzle-orm'; // Added eq, desc
// We'll also need types for RaceConfig and LeaderboardEntry, assuming they are defined elsewhere or we define them here.

// Placeholder for RaceConfig type - replace with actual import if available
interface RaceConfig {
  name: string;
  prizeDistribution: Record<string, number>;
  prizePool?: number; // Added prizePool here
  // Add other relevant fields from your actual RaceConfig
}

// Placeholder for LeaderboardEntry type - replace with actual import if available
interface LeaderboardEntry {
  uid: string;
  userId: string;
  username: string;
  wagered: number;
  rank: number;
  avatarUrl?: string | null;
  won: number; // Base winnings, if applicable
  profit: number; // Profit, if applicable
  // We will add prizeWon here
  prizeWon?: number;
}

export class RaceSnapshotService {
  /**
   * Creates a snapshot of a completed race.
   * This would be triggered after a race concludes.
   * @param raceId - The ID of the race that has concluded (from your main wagerRaces table).
   * @param originalRaceEndDate - The actual end date of the race.
   * @param raceType - E.g., 'monthly', 'weekly'.
   * @param raceConfig - The configuration of the race as it was when it ended.
   * @param finalLeaderboard - The final leaderboard entries for the race.
   */
  async createRaceSnapshot(
    raceId: number, // Assuming your wagerRaces id is number
    originalRaceEndDate: Date,
    raceType: string,
    raceConfig: RaceConfig, // This should be your actual RaceConfig type
    finalLeaderboard: LeaderboardEntry[] // This should be your actual LeaderboardEntry type array
  ): Promise<SelectRaceSnapshot | null> {
    try {
      console.log(`RaceSnapshotService: Creating snapshot for race ${raceId}`);

      // 1. Construct the raceName (e.g., "Monthly Goated Race - July 2025")
      const raceMonth = originalRaceEndDate.toLocaleString('default', { month: 'long' });
      const raceYear = originalRaceEndDate.getFullYear();
      const raceName = `${raceConfig.name || raceType} - ${raceMonth} ${raceYear}`;

      // 2. Calculate prizes won for each leaderboard entry
      const leaderboardWithPrizes = finalLeaderboard.map(entry => {
        const prizePercentage = raceConfig.prizeDistribution[String(entry.rank)];
        const prizePool = raceConfig.prizePool || 0;
        const prizeWon = prizePercentage ? Math.round(prizePool * prizePercentage * 100) / 100 : 0;
        return { ...entry, prizeWon };
      });

      // 3. Prepare the data for insertion
      // Ensure InsertRaceSnapshot is correctly defined in your schema exports
      // For now, we cast to any to bypass strict type checking until InsertRaceSnapshot is confirmed.
      const snapshotData: Omit<InsertRaceSnapshot, 'id' | 'snapshotTakenAt'> = {
        originalRaceEndDate,
        raceType,
        raceName,
        raceConfigData: raceConfig as any, // Cast to any for now
        leaderboardEntriesData: leaderboardWithPrizes as any, // Cast to any for now
      };

      // 4. Insert into the database
      const newSnapshotResult = await db.insert(raceSnapshots).values(snapshotData).returning();
      
      // Drizzle returns an array, get the first element
      const newSnapshot = newSnapshotResult[0] as SelectRaceSnapshot | undefined;

      if (newSnapshot) {
        console.log(`RaceSnapshotService: Snapshot created successfully with ID: ${newSnapshot.id}`);
        return newSnapshot;
      }
      return null;
    } catch (error) {
      console.error(`RaceSnapshotService: Error creating race snapshot for race ${raceId}:`, error);
      throw error; 
    }
  }

  /**
   * Fetches a list of available race snapshots, filtered by type.
   * Returns essential info for a dropdown/selector on the frontend.
   */
  async getSnapshotListByType(raceType: string): Promise<{ id: number; raceName: string; originalRaceEndDate: Date }[]> {
    try {
      const snapshots = await db.select({
        id: raceSnapshots.id,
        raceName: raceSnapshots.raceName,
        originalRaceEndDate: raceSnapshots.originalRaceEndDate,
      })
      .from(raceSnapshots)
      .where(eq(raceSnapshots.raceType, raceType))
      .orderBy(desc(raceSnapshots.originalRaceEndDate));

      return snapshots;
    } catch (error) {
      console.error(`RaceSnapshotService: Error fetching snapshot list for type ${raceType}:`, error);
      throw error;
    }
  }

  /**
   * Fetches the full data for a specific snapshot by its ID.
   */
  async getSnapshotById(snapshotId: number): Promise<{ raceConfigData: RaceConfig; leaderboardEntriesData: LeaderboardEntry[] } | null> {
    try {
      const snapshotResult = await db.select({
        raceConfigData: raceSnapshots.raceConfigData,
        leaderboardEntriesData: raceSnapshots.leaderboardEntriesData,
      })
      .from(raceSnapshots)
      .where(eq(raceSnapshots.id, snapshotId))
      .limit(1);

      if (snapshotResult.length > 0) {
        return {
          raceConfigData: snapshotResult[0].raceConfigData as RaceConfig,
          leaderboardEntriesData: snapshotResult[0].leaderboardEntriesData as LeaderboardEntry[],
        };
      }
      return null;
    } catch (error) {
      console.error(`RaceSnapshotService: Error fetching snapshot by ID ${snapshotId}:`, error);
      throw error;
    }
  }
}

export const raceSnapshotService = new RaceSnapshotService();
export default raceSnapshotService; 