// db/schema.ts - Aggregator File

// Export all from individual schema files
export * from './schema/users'; // Exports users, sessions, relations, InsertUser, SelectUser, etc.
export * from './schema/bonus'; // Exports bonusCodes, bonusCodeClaims, relations, types
export * from './schema/challenges'; // Exports challenges, challengeEntries, relations, types
export * from './schema/affiliateStats';
export * from './schema/goatedWagerLeaderboard';
export * from './schema/historicalRaces';
export * from './schema/leaderboardUsers';
export * from './schema/mockWagerData';
export * from './schema/newsletterSubscriptions';
export * from './schema/notificationPreferences';
export * from './schema/raceSnapshots'; // The new table for this task
export * from './schema/support'; // Exports supportTickets, ticketMessages, relations, types
export * from './schema/syncLogs';
export * from './schema/telegram'; // Exports telegramUsers, relations, types
export * from './schema/transformationLogs';
export * from './schema/verification'; // Exports verificationRequests, relations, types
export * from './schema/wagerRaceParticipants';
export * from './schema/wagerRaces';
export * from './schema/wheelSpins';

// Note: Ensure that each individual schema file (e.g., users.ts, bonus.ts)
// correctly exports all necessary tables, relations, and TypeScript types (InsertType, SelectType).
// Zod schemas (createInsertSchema, createSelectSchema) should also be exported
// from the respective files if they are specific to that table, or from a central
// utility if they are general. For now, we assume InsertUser, SelectUser etc. are
// correctly exported from their respective .ts files.