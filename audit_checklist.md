# GoatedVIPs Platform Audit Checklist

## Structure
- [ ] Consolidate documentation into a single `docs/` directory
- [ ] Prune and optimize static assets
- [ ] Remove or archive legacy/backup files
- [ ] Clarify and document ambiguous directories (e.g., `memory-bank/`, `public/`)

## Performance
- [ ] Optimize frontend bundle size and asset delivery
- [ ] Implement caching for leaderboard and stats endpoints
- [ ] Add response compression (gzip) to API
- [ ] Optimize database queries and add necessary indexes

## Authentication & Security
- [ ] Implement secure token refresh flow
- [ ] Add password reset and email verification
- [ ] Set up session cleanup and audit logging
- [ ] Enforce strict input validation and sanitization

## Wager Race
- [ ] Ensure race parameters are easily configurable
- [ ] Store historical race data and winner snapshots
- [ ] Automate winner notifications (email, in-app, Telegram)
- [ ] Optimize leaderboard performance and fairness

## MVP Tracking
- [ ] Track and display historical MVPs
- [ ] Integrate MVP status into user profiles
- [ ] Ensure data consistency with wager race logic

## Telegram Bot
- [ ] Implement commands for stats, leaderboard, and linking
- [ ] Securely link Telegram and platform accounts
- [ ] Use bot for notifications and account verification

## Bonus Codes & Challenges
- [ ] Automate code distribution based on eligibility
- [ ] Track code claims and prevent duplicates
- [ ] Build admin tools for code/challenge management

## Database
- [ ] Add missing indexes to frequently queried columns
- [ ] Track and version all migration scripts
- [ ] Add constraints and validation at the DB level

## Documentation
- [ ] Keep living documentation up to date
- [ ] Add/maintain dev guides and onboarding docs

## Monitoring & Testing
- [ ] Set up error tracking and performance monitoring
- [ ] Add health checks and monitoring alerts
- [ ] Increase unit, integration, and E2E test coverage

## New Actions
- [ ] Refactor backend to always use DB-configured prize pool/distribution for wager races
- [ ] Update previous race logic to fetch real historical data from wagerRaces/wagerRaceParticipants
- [ ] Add/verify DB indexes for wagerRaceParticipants.raceId, userId, and position
- [ ] Implement or audit winner notification logic (email, in-app, Telegram) after race completion
- [ ] Add/verify caching for leaderboard endpoints and race queries
- [ ] Add/verify unit/integration tests for race completion, historical snapshot, and notification logic
- [ ] Document race completion and notification flow in scope.md

## Wager Race Logic Renovation
- [ ] Refactor backend to always use DB-configured prize pool/distribution (remove all hardcoded values)
- [ ] Move leaderboard aggregation and sorting to SQL queries with proper indexes
- [ ] Store full historical race snapshots at race completion (all metadata, participants, prizes)
- [ ] Implement post-race job for winner notifications (email, in-app, Telegram)
- [ ] Add/verify DB indexes on wagerRaceParticipants (raceId, userId, position)
- [ ] Add caching for leaderboard endpoints and race queries (invalidate on wager update/race completion)
- [ ] Refactor frontend to fetch all race config/prize info from backend
- [ ] Add admin UI for race configuration and historical review
- [ ] Improve loading states and error handling for leaderboard/race pages
- [ ] Add integration tests for race completion, snapshotting, and notifications

## Account Linking & Verification
- [ ] Ensure all endpoints are protected by strong authentication middleware
- [ ] Add logging for all linking/unlinking/admin actions
- [ ] Add email/in-app notifications for all status changes (request, approval, rejection)
- [ ] Automate admin approval for trusted users or with multi-factor verification
- [ ] Add rate limiting and abuse monitoring for link requests
- [ ] Provide granular feedback for rejected requests (reason, next steps)
- [ ] Show estimated review time or queue position (if possible)
- [ ] Add user-facing logs/history of linking attempts and status
- [ ] Build admin dashboard for managing link requests (filters, bulk actions)
- [ ] Add tests for all linking flows, including edge cases

## General Platform Renovation
- [ ] Prune unused/legacy files and assets
- [ ] Consolidate and update all documentation and dev guides
- [ ] Standardize code style and enforce with linting/formatting tools
- [ ] Modularize business logic and shared utilities
- [ ] Optimize frontend bundle size (code splitting, lazy loading)
- [ ] Implement server-side response compression and caching
- [ ] Add health checks and monitoring for all critical endpoints
- [ ] Enforce strict input validation and sanitization everywhere
- [ ] Add/verify 2FA, password reset, and session management
- [ ] Set up audit logging for all sensitive actions
- [ ] Improve all loading, error, and empty states
- [ ] Ensure mobile responsiveness and accessibility
- [ ] Add onboarding flows and contextual help where needed

## Documentation & Checklist Maintenance
- [ ] Update scope.md and audit_checklist.md after every major change
- [ ] Add/maintain dev guides and onboarding docs
- [ ] Document all new flows, endpoints, and admin tools

---

_Add new tasks below as the audit progresses._ 