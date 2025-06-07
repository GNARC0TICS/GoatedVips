// db/schema.ts - Aggregator File

// Export all from individual schema files
export * from './users'; // Exports users, sessions, relations, InsertUser, SelectUser, etc.
export * from './bonus'; // Exports bonusCodes, bonusCodeClaims, relations, types
export * from './challenges'; // Exports challenges, challengeEntries, relations, types
export * from './affiliateStats';
export * from './goatedWagerLeaderboard';
export * from './historicalRaces';
export * from './leaderboardUsers';
export * from './mockWagerData';
export * from './newsletterSubscriptions';
export * from './notificationPreferences';
export * from './raceSnapshots'; // The new table for this task
export * from './support'; // Exports supportTickets, ticketMessages, relations, types
export * from './syncLogs';
export * from './telegram'; // Exports telegramUsers, relations, types
export * from './transformationLogs';
export * from './verification'; // Exports verificationRequests, relations, types
export * from './wagerRaceParticipants';
export * from './wagerRaces';
export * from './wheelSpins';

// Note: Ensure that each individual schema file (e.g., users.ts, bonus.ts)
// correctly exports all necessary tables, relations, and TypeScript types (InsertType, SelectType).
// Zod schemas (createInsertSchema, createSelectSchema) should also be exported
// from the respective files if they are specific to that table, or from a central
// utility if they are general. For now, we assume InsertUser, SelectUser etc. are
// correctly exported from their respective .ts files.