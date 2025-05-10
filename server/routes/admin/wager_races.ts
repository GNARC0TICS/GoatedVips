import { Router, Request, Response } from 'express';
import { db } from '@db';
import * as schemas from '@db/schema'; // Import all schemas as a module
import { eq, desc, sql } from 'drizzle-orm';
import { requirePlatformAdmin } from '../../middleware/jwtAuth'; // Adjusted path
import { API_CONFIG } from '../../config/api'; // For fetching leaderboard data
import { transformLeaderboardData } from '../../routes'; // Assuming this is where it lives (server/routes.ts)

const router = Router();

// GET all wager races (for admin management)
router.get('/', requirePlatformAdmin, async (_req: Request, res: Response) => {
  try {
    const races = await db.select().from(schemas.wagerRaces).orderBy(desc(schemas.wagerRaces.createdAt));
    res.json(races);
  } catch (error) {
    console.error('Error fetching wager races:', error);
    res.status(500).json({ message: 'Failed to fetch wager races' });
  }
});

// POST create a new wager race
router.post('/', requirePlatformAdmin, async (req: Request, res: Response) => {
  try {
    // Add Zod validation here based on wagerRaceSchema from WagerRaceManagement.tsx
    const newRaceData = req.body; // TODO: Validate this data
    const [createdRace] = await db.insert(schemas.wagerRaces).values(newRaceData).returning();
    res.status(201).json(createdRace);
  } catch (error) {
    console.error('Error creating wager race:', error);
    res.status(500).json({ message: 'Failed to create wager race' });
  }
});

// PUT update an existing wager race
router.put('/:raceId', requirePlatformAdmin, async (req: Request, res: Response) => {
  const { raceId } = req.params;
  try {
    // Add Zod validation here
    const updatedRaceData = req.body; // TODO: Validate this data
    const [updatedRace] = await db.update(schemas.wagerRaces)
      .set({ ...updatedRaceData, updatedAt: new Date() })
      .where(eq(schemas.wagerRaces.id, raceId))
      .returning();
    if (!updatedRace) return res.status(404).json({ message: 'Wager race not found' });
    res.json(updatedRace);
  } catch (error) {
    console.error(`Error updating wager race ${raceId}:`, error);
    res.status(500).json({ message: 'Failed to update wager race' });
  }
});

// DELETE a wager race
router.delete('/:raceId', requirePlatformAdmin, async (req: Request, res: Response) => {
  const { raceId } = req.params;
  try {
    await db.delete(schemas.wagerRaceParticipantSnapshots).where(eq(schemas.wagerRaceParticipantSnapshots.wagerRaceId, raceId)); // Delete snapshots first
    const [deletedRace] = await db.delete(schemas.wagerRaces).where(eq(schemas.wagerRaces.id, raceId)).returning();
    if (!deletedRace) return res.status(404).json({ message: 'Wager race not found' });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting wager race ${raceId}:`, error);
    res.status(500).json({ message: 'Failed to delete wager race' });
  }
});

// PUT update wager race status (e.g., live, completed)
router.put('/:raceId/status', requirePlatformAdmin, async (req: Request, res: Response) => {
  const { raceId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const [updatedRace] = await db.update(schemas.wagerRaces)
      .set({ status, updatedAt: new Date() })
      .where(eq(schemas.wagerRaces.id, raceId))
      .returning();

    if (!updatedRace) return res.status(404).json({ message: 'Wager race not found' });

    // If status changed to 'completed', trigger snapshot logic
    if (status === 'completed' && updatedRace.status !== 'completed') { // Check previous status if needed from fetched updatedRace
      await snapshotRaceLeaderboard(raceId, updatedRace.type); // Pass race type for fetching correct leaderboard period
    }

    res.json(updatedRace);
  } catch (error) {
    console.error(`Error updating status for wager race ${raceId}:`, error);
    res.status(500).json({ message: 'Failed to update wager race status' });
  }
});

async function snapshotRaceLeaderboard(raceId: string, raceType: string) {
  console.log(`Snapshotting leaderboard for race ${raceId}, type ${raceType}...`);
  try {
    // Determine leaderboard period based on raceType (e.g., 'monthly', 'weekly')
    // This needs to map to the keys used in transformLeaderboardData (e.g., 'this_month')
    let leaderboardPeriodKey: 'today' | 'this_week' | 'this_month' | 'all_time' = 'this_month';
    if (raceType === 'weekly') leaderboardPeriodKey = 'this_week';
    // Add more mappings if needed

    // Fetch final leaderboard data (using the existing mechanism for /api/affiliate/stats)
    const goatedLeaderboardUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`;
    const response = await fetch(goatedLeaderboardUrl, {
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Goated.com leaderboard for snapshot: ${response.status}`);
    }
    const rawLeaderboardData = await response.json();
    const transformedData = await transformLeaderboardData(rawLeaderboardData);
    
    // Extract participants for the relevant period
    const participantsToSnapshot = transformedData.data[leaderboardPeriodKey]?.data || [];

    // TODO: Fetch prize distribution for this raceId from wagerRaces table
    // const raceDetails = await db.query.wagerRaces.findFirst({ where: eq(wagerRaces.id, raceId) });
    // const prizeDistribution = raceDetails?.prizeDistribution; // This is a JSONB field

    for (let i = 0; i < participantsToSnapshot.length; i++) {
      const participant = participantsToSnapshot[i];
      const rank = i + 1;
      
      // Find local user by goatedId
      let localUser = await db.query.usersSchema.findFirst({
        where: eq(schemas.users.goatedId, participant.uid),
        columns: { id: true }
      });

      // If user doesn't exist locally, we might need to create a shell or skip.
      // For now, let's assume syncUserProfiles has run and users exist.
      if (!localUser && ensureUserProfile) { // ensureUserProfile from server/index.ts
         const createdProfile = await ensureUserProfile(participant.uid); // Ensure profile exists
         if(createdProfile && createdProfile.id) {
            localUser = { id: createdProfile.id };
         }
      }

      const snapshotEntry = {
        wagerRaceId: raceId,
        userId: localUser?.id || null, // Handle if local user still not found
        goatedId: participant.uid,
        usernameAtRaceEnd: participant.name,
        finalRank: rank,
        wageredAmount: participant.wagered[leaderboardPeriodKey]?.toString() || '0',
        // prizeWonAmount: calculatePrize(rank, prizeDistribution), // TODO: Implement prize calculation
        snapshotTimestamp: new Date(),
      };
      await db.insert(schemas.wagerRaceParticipantSnapshots).values(snapshotEntry);
    }
    console.log(`Successfully snapshotted leaderboard for race ${raceId}`);
  } catch (error) {
    console.error(`Error snapshotting race ${raceId}:`, error);
    // Potentially log this error to transformation_logs or a dedicated error log
  }
}

export default router; 