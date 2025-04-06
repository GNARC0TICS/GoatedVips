import { db } from "./db/index.js";
import { wagerRaces, wagerRaceParticipants } from "./db/schema.js";
import { eq } from "drizzle-orm";

async function testRaceData() {
  try {
    console.log("Testing race data persistence...");
    
    // 1. Create a test race
    const testRaceData = {
      title: "Test Monthly Race - April 2025",
      name: "Test Monthly Race - April 2025",
      type: "monthly",
      status: "completed",
      startDate: new Date(2025, 3, 1), // April 1, 2025
      endDate: new Date(2025, 3, 30, 23, 59, 59), // April 30, 2025
      prizePool: "500",
      completedAt: new Date(),
      minWager: "0"
    };
    
    const [testRace] = await db.insert(wagerRaces)
      .values(testRaceData)
      .returning();
    
    console.log("Created test race:", testRace);
    
    // 2. Add some participants
    const participants = [
      { position: 1, username: "top_player", userId: "user123", wagered: "12500", prizeAmount: "250", prizeClaimed: false },
      { position: 2, username: "second_place", userId: "user456", wagered: "10000", prizeAmount: "150", prizeClaimed: false },
      { position: 3, username: "third_place", userId: "user789", wagered: "7500", prizeAmount: "75", prizeClaimed: false }
    ];
    
    for (const participant of participants) {
      await db.insert(wagerRaceParticipants)
        .values({
          ...participant,
          raceId: testRace.id,
          joinedAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoNothing();
    }
    
    console.log("Added participants to race");
    
    // 3. Retrieve and display the race with participants
    const [race] = await db
      .select()
      .from(wagerRaces)
      .where(eq(wagerRaces.id, testRace.id));
    
    const raceParticipants = await db
      .select()
      .from(wagerRaceParticipants)
      .where(eq(wagerRaceParticipants.raceId, testRace.id));
    
    console.log("Retrieved race:", race);
    console.log("Retrieved participants:", raceParticipants);
    
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Error testing race data:", error);
  } finally {
    process.exit(0);
  }
}

testRaceData();