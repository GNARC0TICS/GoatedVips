`# GoatedVIPs Platform Scope Reference

This document lists all core files and directories, their purpose, routing, and main functionality. Update this file as the codebase evolves. Use as the main reference for audits and changes.

---

## Frontend (`client/`)
- **client/index.html**: Main HTML entry point for the React app.
- **client/public/**: Static assets (images, videos, SVGs, etc.)
- **client/src/App.tsx**: Root React component, sets up routing and layout.
- **client/src/components/**: Modular React components, organized by feature (e.g., profile, ui, chat, memory-bank, mvp, etc.)
- **client/src/pages/**: Route-based page components (e.g., Home, Dashboard, UserProfile, admin pages)
- **client/src/hooks/**: Custom React hooks for data fetching, auth, etc.
- **client/src/lib/**: Shared utilities and helpers (e.g., auth, navigation, queryClient)
- **client/src/services/**: API and business logic services (e.g., profileService)
- **client/src/styles/**: CSS and font imports
- **client/src/utils/**: Utility functions (e.g., formatting, classnames)
- **client/tailwind.config.ts**: Tailwind CSS configuration

## Backend (`server/`)
- **server/index.ts**: Main Express server entry point
- **server/config/**: Environment, API, and auth configuration
- **server/routes/**: API route handlers (account-linking, users, challenges, admin, etc.)
- **server/middleware/**: Express middleware (auth, rate-limit, error handling)
- **server/services/**: Business logic and integrations (e.g., goatedApiService, userService, telegramBotService)
- **server/utils/**: Helper functions (e.g., logger, error, response-utils)
- **server/templates/**: Email and notification templates
- **server/docs/**: API and platform documentation
- **server/tasks/**: Background jobs and scheduled tasks
- **server/types/**: TypeScript type definitions for backend

## Database (`db/`)
- **db/schema/**: Table definitions (users, bonus, challenges, telegram, verification)
- **db/migrations/**: SQL migration scripts
- **db/schema.ts**: Main schema entry point
- **db/index.ts**: DB connection and setup

## Shared & Config
- **package.json / package-lock.json**: Project dependencies and scripts
- **tsconfig.json**: TypeScript configuration
- **vite.config.ts / tailwind.config.ts**: Build and styling configs
- **replit.nix / .replit**: Replit environment configs

## Assets & Fonts
- **fonts/**: Custom font files
- **attached_assets/**: Images, screenshots, and pasted documentation
- **memory-bank/**: Living documentation, audits, and dev guides

## Documentation
- **docs/APP_DOCUMENTATION.md**: High-level platform documentation
- **docs/CODEBASE_OVERVIEW.md**: Technical and architectural overview
- **docs/structure_audit.md**: Structure and performance audit
- **docs/audit_checklist.md**: Ongoing actionable audit checklist
- **docs/scope.md**: (This file) Main reference for file purposes and routing

---

## [2024-04-30] Wager Race Logic Audit Summary
- Reviewed: WagerRaces.tsx, LeaderboardTable.tsx, useLeaderboard.ts, db/schema.ts, server/services/platformApiService.ts
- Strengths: Configurability (DB-driven), historical storage, clear separation of concerns
- Areas for optimization: Prize config should always be DB-driven, previous race logic should use real data, add DB indexes, implement winner notification, optimize leaderboard queries, add tests and monitoring
- See audit_checklist.md for new actionable tasks

## [2024-04-30] Platform Renovation Plan
- See audit_checklist.md for a detailed, actionable breakdown of all renovation and optimization tasks.
- Focus areas: Wager Race Logic, Account Linking, General Platform, Documentation.
- All new flows, endpoints, and admin tools must be documented here as they are implemented.
- The goal is a maintainable, high-performance, user-friendly app.

_Add new files, directories, and details as the codebase evolves._

## Backend Services (server/services/)

| File                        | Purpose / Key Methods                                                                 | Patterns / Coupling / Retry | Refactor Level | Notes/Flags                                                                                 |
|-----------------------------|---------------------------------------------------------------------------------------|-----------------------------|----------------|--------------------------------------------------------------------------------------------|
| **wagerLeaderboardSync.ts** | Syncs Goated wager leaderboard to DB. Upserts wager fields for all users.             | Uses goatedApiService.      | ✅ clean        | Runs on startup & interval. No business logic, just sync.                                  |
| **telegramBotService.ts**   | Telegram bot integration. Handles `/start` and `/verify` commands, user linking.      | None                        | ✅ clean        | Singleton. No tight coupling. Minimal logic.                                                |
| **userService.ts**          | Core user CRUD operations and email verification. Database operations only.           | None                        | ✅ clean        | Trimmed to core CRUD. Profile logic moved to profileService.                               |
| **goatedApiService.ts**     | Handles all external Goated.com API calls. Retry logic, token mgmt, error handling.   | Exponential backoff retry.  | ✅ clean        | No business logic, just API. Good separation.                                               |
| **raceService.ts**          | All wager race operations: current/previous races, user positions, DB management.      | Uses goatedApiService data. | ✅ clean        | Extracted from platformApiService. Single responsibility for race logic.                    |
| **profileService.ts**       | Profile creation, Goated account linking, profile sync, wager data updates.            | Uses goatedApiService.      | ✅ clean        | Extracted from platformApiService & userService. Consolidates all profile operations.       |
| **statSyncService.ts**      | Data transformation, leaderboard processing, statistical aggregations, analytics.      | Uses goatedApiService.      | ✅ clean        | Extracted from platformApiService. Pure data processing and transformation.                 |
| ~~**platformApiService.ts**~~ | ~~Internal business logic~~: ~~transforms~~, ~~syncs~~, ~~race~~, ~~profile~~, endpoints. | ~~Uses goatedApiService.~~ | 🔥 **RETIRED**   | **Successfully retired! All logic distributed to focused services.**                        |
| **cacheService.ts**         | In-memory cache with TTL, namespaces, stats, stale-while-revalidate, error caching.   | None                        | ✅ clean        | Good separation. Could be extracted to core utils if used elsewhere.                        |

// See directory-tree.md for file-level comments and refactor suggestions.

// 📦 Route Inventory & Refactor Notes (June 2025)
// Added after comprehensive audit of all backend routes. See directory-tree.md for file-level comments.

| Endpoint/Path                       | Method | Feature(s)         | Middleware                | Key Dependencies         | Coupling Level         | Refactor Notes / Issues                                                                                  |
|--------------------------------------|--------|--------------------|---------------------------|-------------------------|------------------------|----------------------------------------------------------------------------------------------------------|
| **users.ts**                        |        |                    |                           |                         |                        |                                                                                                          |
| `/search`                           | GET    | 🟢🟡                | none                      | db                      | Fat (direct DB/logic)  | Should call userService for search logic.                                                                |
| `/:id`                              | GET    | 🟢🟡                | none                      | db                      | Fat (direct DB/logic)  | Should call userService for lookup/formatting.                                                           |
| `/leaderboard/:timeframe`            | GET    | 🟡                 | none                      | db                      | Fat (direct DB/logic)  | Should call leaderboard/stat service.                                                                    |
| `/admin/all`                        | GET    | 🔴                 | requireAuth, requireAdmin | db                      | Fat (direct DB/logic)  | Should call userService for admin queries.                                                               |
| `/ensure-profile`                    | POST   | 🟢                 | none                      | profileService          | Service-wrapped        | ✅ Should migrate to use profileService.ensureUserProfile().                                             |
| `/:id/stats`                        | GET    | 🟡                 | none                      | db                      | Fat (direct DB/logic)  | Should call userService for stats/tier logic.                                                            |
| `/:id`                              | PATCH  | 🟢                 | none                      | db                      | Fat (direct DB/logic)  | Should call userService for updates.                                                                     |
| `/batch`                            | GET    | 🟢🟡                | none                      | db                      | Fat (direct DB/logic)  | Should call userService for batch fetch.                                                                 |
| **account-linking.ts**               |        |                    |                           |                         |                        |                                                                                                          |
| `/request-link`                     | POST   | 🟢                 | (auth via req.user)        | profileService          | Service-wrapped        | ✅ Now uses dedicated profileService. Should add explicit auth middleware.                               |
| `/unlink-account`                    | POST   | 🟢                 | (auth via req.user)        | profileService          | Service-wrapped        | ✅ Should migrate to use profileService.unlinkGoatedAccount().                                           |
| `/check-goated-username/:username`   | GET    | 🟢                 | (auth via req.user)        | goatedApiService        | Service-wrapped        | Good, but should use explicit middleware for auth.                                                       |
| `/admin-approve-link`                | POST   | 🟢🔴               | (admin via req.user)       | profileService          | Service-wrapped        | ✅ Now uses dedicated profileService. Should add explicit admin middleware.                              |
| `/admin-reject-link`                 | POST   | 🟢🔴               | (admin via req.user)       | profileService          | Service-wrapped        | ✅ Now uses dedicated profileService. Should add explicit admin middleware.                              |
| **goombas-admin.ts**                 |        |                    |                           |                         |                        |                                                                                                          |
| `/admin/login`                      | POST   | 🔴                 | none                      | auth-utils              | Service-wrapped        | Good, uses utility for validation.                                                                       |
| `/admin/logout`                     | POST   | requireAdmin        | auth-utils                | Service-wrapped         | Good, uses utility for session clear.                                                                    |
| `/admin/analytics`                   | GET    | 🔴                 | requireAdmin               | db                      | Fat (direct DB/logic)  | Should move analytics logic to a service.                                                                |
| `/admin/users`                       | GET    | 🔴                 | requireAdmin               | db                      | Fat (direct DB/logic)  | Should call userService.                                                                                 |
| `/admin/users/:id`                   | GET    | 🔴                 | requireAdmin               | db                      | Fat (direct DB/logic)  | Should call userService.                                                                                 |
| `/admin/auth-status`                 | GET    | none                | session                    | Service-wrapped         | Good, simple session check.                                                                              |
| **webhook.ts**                       |        | 🟠                 | rateLimiter                | bot, telegram           | Service-wrapped         | Good, all logic delegated to bot handlers.                                                               |
| **bonus-challenges.ts**              |        |                    |                           |                         |                        |                                                                                                          |
| `/bonus-codes`                       | GET    | 🟡                 | rateLimiter                | db                      | Service-wrapped         | Good, uses rate limit and caching headers.                                                               |
| `/admin/bonus-codes`                 | GET    | 🔴                 | isAdmin                    | db                      | Service-wrapped         | Good, uses admin middleware.                                                                             |
| `/admin/bonus-codes`                 | POST   | 🔴                 | isAdmin                    | db                      | Service-wrapped         | Good, uses admin middleware.                                                                             |
| `/admin/bonus-codes/:id`             | PUT    | 🔴                 | isAdmin                    | db                      | Service-wrapped         | Good, uses admin middleware.                                                                             |
| `/admin/bonus-codes/:id`             | DELETE | 🔴                 | isAdmin                    | db                      | Service-wrapped         | Good, uses admin middleware.                                                                             |
| **challenges.ts**                    |        | 🟡                 | isAdmin (admin routes)      | db                      | Service-wrapped (admin) | Good, admin and public routes separated.                                                                 |
| `/admin/challenges`                  | GET    | 🔴                 | isAdmin                    | db                      | Service-wrapped         | Good, uses admin middleware.                                                                             |
| `/admin/challenges`                  | POST   | 🔴                 | isAdmin                    | db                      | Service-wrapped         | Good, uses admin middleware.                                                                             |
| `/admin/challenges/:id`              | PUT    | 🔴                 | isAdmin                    | db                      | Service-wrapped         | Good, uses admin middleware.                                                                             |
| `/admin/challenges/:id`              | DELETE | 🔴                 | isAdmin                    | db                      | Service-wrapped         | Good, uses admin middleware.                                                                             |
| `/challenges`                        | GET    | 🟡                 | none                       | db                      | Service-wrapped         | Good, public fetch.                                                                                      |
| `/challenges/:id/entries`            | POST   | 🟡                 | (auth via req.user)         | db                      | Fat (direct DB/logic)  | Should use explicit auth middleware.                                                                     |
| **apiRoutes.ts**                     |        |                    |                           |                         |                        |                                                                                                          |
| `/affiliate/stats`                   | GET    | 🔵🟡               | cache(15min)                | statSyncService          | Service-wrapped         | ✅ Now uses dedicated statSyncService for data transformation and analytics.                             |
| `/wager-races/current`               | GET    | 🟣                 | cache(15min)                | raceService              | Service-wrapped         | ✅ Now uses dedicated raceService instead of platformApiService.                                        |
| `/wager-races/previous`              | GET    | 🟣                 | cache(15min)                | raceService              | Service-wrapped         | ✅ Now uses dedicated raceService instead of platformApiService.                                        |
| `/wager-race/position`               | GET    | 🟣                 | none                        | raceService              | Service-wrapped         | ✅ Now uses dedicated raceService instead of platformApiService.                                        |
| `/sync/trigger`                      | POST   | 🔴                 | none                        | platformApiService       | Service-wrapped         | Should require admin middleware.                                                                         |
| `/test/goated-raw`                   | GET    | none                | goatedApiService            | Service-wrapped         | Good, for debugging only.                                                                               |

### Refactor Checklist
- [ ] Migrate all direct DB/business logic in `users.ts` to `userService`/`profileService`
- [ ] Move analytics and user management logic in `goombas-admin.ts` to `adminService` or `userService`
- [ ] Enforce explicit auth/admin middleware in `account-linking.ts` and `challenges.ts`
- [ ] Add admin middleware to `/sync/trigger` in `apiRoutes.ts`
- [x] Keep `apiRoutes.ts` as a clean controller layer using proper services
- [x] Extract profile and account linking logic to dedicated `profileService.ts`
- [x] Consolidate multiple `ensureUserProfile()` implementations into single service 

// 🧱 Middleware Inventory & Refactor Checklist (June 2025)
// Added after comprehensive audit of all backend middleware. See directory-tree.md for file-level comments.

| File                      | Purpose                                                                 | Applied In                | Modularity                | Cohesion Level         | Refactor Notes                                                                                  | Feature Coverage Tags |
|---------------------------|-------------------------------------------------------------------------|---------------------------|---------------------------|------------------------|--------------------------------------------------------------------------------------------------|----------------------|
| **auth.ts**               | Authenticates user via token, attaches user to req.                     | Most user/account routes  | High (clean signature)    | Single concern         | Standardize usage (replace all `req.user?.id` checks with this).                                | 🟢🔴🟡🟣               |
| **admin.ts**              | Verifies admin session (`req.session.isAdmin`).                         | All `/admin` routes       | High (clean signature)    | Single concern         | Standardize usage (replace all `req.user?.admin` checks with this).                             | 🔴                   |
| **domain-handler.ts**     | Marks requests from `/goombas.net` domain for special handling.         | Global (entrypoint)       | High (stateless, reusable)| Single concern         | Confirm all domain-specific logic is handled via this, not inline in routes.                    | 🔴                   |
| **error-handler.ts**      | Global error and 404 handler, standardizes error responses.             | All routes (app.use)      | High (universal)          | Single concern         | Ensure all thrown errors use AppError for consistency.                                          | All                  |
| **rate-limit.ts**         | Provides login and API rate limiters (express-rate-limit).              | Login, API endpoints      | High (reusable)           | Single concern         | Ensure all sensitive endpoints use these, avoid per-route custom limiters.                      | 🟢🔴🟡🟣               |

### Refactor Checklist (Middleware)
- [ ] Replace all inline `req.user?.id`/`req.user?.admin` checks with `requireAuth`/`requireAdmin` middleware.
- [ ] Audit all routes for missing rate limiting (especially login, webhook, and admin actions).
- [ ] Confirm all domain-specific logic is handled via `domain-handler`, not in routes.
- [ ] Standardize error throwing to use `AppError` for all custom errors.

---

## 🛠 Service Refactor Sprint: Platform Split (June 2025) - ✅ **COMPLETED**

### Objective ✅ **ACHIEVED**
~~Refactor~~ **Successfully refactored** the monolithic `platformApiService.ts` into focused, single-responsibility services to improve modularity, testability, and maintainability.

### Service Refactor Checklist ✅ **ALL COMPLETED**
- [x] ✅ Create `raceService.ts` and migrate all race logic
- [x] ✅ Create `profileService.ts` and move Goated UID/linking logic  
- [x] ✅ Create `statSyncService.ts` and handle wager data transform
- [x] ✅ Refactor `userService.ts` to core user CRUD only
- [x] ✅ **Successfully retire `platformApiService.ts`**
- [x] ✅ Update all affected routes to call new services

### Completed: RaceService (✅)
**File:** `server/services/raceService.ts`

**Extracted Methods:**
- `getCurrentRace(leaderboardData)` - Current race data with live leaderboard
- `getPreviousRace()` - Historical or simulated previous race data
- `getUserRacePosition(uid, leaderboardData)` - User's position in current race
- `getRaceById(raceId)` - Fetch race from database
- `getRaceParticipants(raceId)` - Get all participants for a race
- `createRace(config)` - Create new race record
- `updateRaceStatus(raceId, status)` - Update race status (upcoming/live/completed)

**Private Helpers:**
- `transformToRaceData()` - Transform leaderboard to race format
- `getLastCompletedRace()` - Get most recent completed race from DB
- `buildRaceDataFromDB()` - Build race data from DB record
- `getSimulatedPreviousRace()` - Fallback for missing historical data
- `saveCompletedRaceData()` - Save race completion snapshot
- `updateRaceParticipants()` - Update/insert race participants
- `createCompletedRace()` - Create new completed race with participants
- `calculatePrizeAmount()` - Calculate prize for position
- `getCurrentRaceConfig()` - Get race configuration (TODO: move to DB)
- `getCurrentRaceEndDate()` - Get current race end date
- `logRaceOperation()` - Log race operations to transformation_logs

**Interfaces Exported:**
- `RaceData` - Complete race information
- `RacePositionData` - User position data
- `RaceConfig` - Race configuration structure

**Dependencies:**
- Uses `db` for database operations
- Requires `LeaderboardData` from platformApiService (TODO: extract to shared types)
- Logs operations to `transformationLogs` table

### Completed: ProfileService (✅)
**File:** `server/services/profileService.ts`

**Extracted Methods:**
- `ensureUserProfile(userId)` - Create/find profile from Goated API or placeholder
- `requestGoatedAccountLink(userId, goatedUsername)` - User-initiated account linking
- `approveGoatedAccountLink(userId, goatedId, approvedBy)` - Admin approval of linking
- `rejectGoatedAccountLink(userId, reason, rejectedBy)` - Admin rejection of linking
- `unlinkGoatedAccount(userId)` - Unlink Goated account
- `syncUserProfiles(leaderboardData)` - Bulk profile sync from API data
- `updateWagerData(leaderboardData)` - Update user wager statistics
- `refreshGoatedUserData(userId, goatedId)` - Refresh individual user data

**Private Helpers:**
- `findExistingProfile()` - Find profile by ID or Goated ID
- `createFromGoatedData()` - Create profile from Goated API data
- `createPlaceholderProfile()` - Create temporary profile placeholder
- `findUserInLeaderboard()` - Locate user in leaderboard data
- `buildRankMaps()` - Build ranking maps for all timeframes
- `profileNeedsUpdate()` - Check if profile data needs updating
- `updateExistingProfile()` - Update existing profile with new data
- `createNewProfile()` - Create new profile from leaderboard data
- `findUserById()`, `findUserByGoatedId()`, `updateUser()` - Basic user operations
- `logProfileOperation()` - Log profile operations to transformation_logs

**Interfaces Exported:**
- `SyncStats` - Profile synchronization statistics
- `LinkingResult` - Account linking operation results
- `ProfileCreateOptions` - Profile creation configuration

**Dependencies:**
- Uses `db` for database operations
- Requires `goatedApiService` for external API calls
- Uses `preparePassword` for secure password hashing
- Logs operations to `transformationLogs` table

**Consolidates Logic From:**
- `platformApiService.syncUserProfiles()` and `updateWagerData()`
- `userService` account linking methods
- Multiple `ensureUserProfile()` implementations
- Various profile creation utilities

### Completed: StatSyncService (✅)
**File:** `server/services/statSyncService.ts`

**Extracted Methods:**
- `getLeaderboardData()` - Fetch and transform leaderboard data from external APIs
- `getAggregatedStats()` - Calculate statistical aggregations for analytics
- `getTopPerformers(limit)` - Get top performers for each time period (MVP cards)
- `getUserRankings(userId)` - Get user ranking across all time periods
- `storeAffiliateSnapshot()` - Store affiliate statistics snapshots for historical tracking

**Private Helpers:**
- `transformToLeaderboard()` - Core transformation from raw API data to standardized format
- `sortByWagered()` - Sort leaderboard data by wagered amount for time periods
- `extractDataArray()` - Extract data arrays from various API response formats
- `processExtractedJson()` - Process complex nested API responses
- `findUserPosition()` - Find user position in leaderboard data
- `logTransformation()` - Log transformation operations to transformation_logs

**Interfaces Exported:**
- `LeaderboardData` - Complete structured leaderboard data for all timeframes
- `StatsAggregation` - Statistical aggregations with totals and calculated metrics
- `TimePeriod` - Type definitions for time period sorting

**Dependencies:**
- Uses `goatedApiService` for external API data fetching
- Uses `db` for affiliate statistics storage and transformation logging
- No user management or race-specific dependencies

**Consolidates Logic From:**
- `platformApiService.getLeaderboardData()` and `transformToLeaderboard()`
- All data transformation and sorting utilities
- Statistical calculation and aggregation methods
- Analytics and admin dashboard data processing

### Next Steps
1. **Refactor userService.ts**: Reduce to core CRUD operations only
2. **Deprecate platformApiService.ts**: Remove remaining logic and retire the service
3. **Update routes**: Migrate all routes to use new raceService, profileService, and statSyncService 