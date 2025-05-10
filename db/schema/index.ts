// Export all schema files to be used by Drizzle
import * as supabaseUsers from './supabase-users';
import * as bonus from './bonus';
import * as challenges from './challenges';
import * as telegram from './telegram';
import * as users from './users';
import * as verification from './verification';
import * as wagerRaces from './wager_races';
import * as transformationLogs from './transformation_logs';

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
};