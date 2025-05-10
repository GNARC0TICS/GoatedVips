// Export all schema files to be used by Drizzle
import * as supabaseUsers from './supabase-users';
import * as bonus from './bonus';
import * as challenges from './challenges';
import * as telegram from './telegram';
import * as users from './users';
import * as verification from './verification';
import * as wagerRaces from './wager_races';
import * as transformationLogs from './transformation_logs';
import * as wagerRaceParticipantSnapshots from './wager_race_participant_snapshots';

// Export all schemas for use in database initialization
export {
  supabaseUsers,
  bonus,
  challenges,
  telegram,
  users,
  verification,
  wagerRaces,
  transformationLogs,
  wagerRaceParticipantSnapshots,
};

// Default export for convenience
export default {
  supabaseUsers,
  bonus,
  challenges,
  telegram,
  users,
  verification,
  wagerRaces,
  transformationLogs,
  wagerRaceParticipantSnapshots,
};