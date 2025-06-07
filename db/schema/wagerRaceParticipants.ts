import { index } from "drizzle-orm/pg-core";

export const wagerRaceParticipants = pgTable("wager_race_participants", {
  raceId: integer("race_id"),
  userId: integer("user_id"),
  position: integer("position"),
  previousPosition: integer("previous_position"),
  // ... existing columns ...
}, (table) => ({
  raceIdx: index("idx_race_id").on(table.raceId),
  userIdx: index("idx_user_id").on(table.userId),
  posIdx: index("idx_position").on(table.position),
})); 