import { pgTable, serial, text, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";

export const historicalRaces = pgTable("historical_races", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  year: text("year").notNull(),
  prizePool: decimal("prize_pool", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  participants: jsonb("participants").notNull(), 
  totalWagered: decimal("total_wagered", { precision: 18, scale: 2 }).notNull(),
  participantCount: text("participant_count").notNull(), 
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  metadata: jsonb("metadata").default('{}').notNull(),
});

// Export types
export type InsertHistoricalRace = typeof historicalRaces.$inferInsert;
export type SelectHistoricalRace = typeof historicalRaces.$inferSelect; 