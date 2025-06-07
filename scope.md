# GoatedVIPs Platform Scope Reference

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
- **APP_DOCUMENTATION.md**: High-level platform documentation
- **CODEBASE_OVERVIEW.md**: Technical and architectural overview
- **structure_audit.md**: Structure and performance audit
- **audit_checklist.md**: Ongoing actionable audit checklist
- **scope.md**: (This file) Main reference for file purposes and routing

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