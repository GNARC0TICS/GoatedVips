# GoatedVIPs Platform

## Overview

GoatedVIPs is an independent platform created by an established Goated.com affiliate partner. The platform serves as a community hub for players referred under the GoatedVips affiliate code, offering exclusive features including leaderboards, wager races, bonus challenges, and community management tools.

The platform is built with a modern tech stack featuring React + TypeScript frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and includes WebSocket support for real-time updates. It integrates with external APIs and includes a Telegram bot for community management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite build system
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: TanStack React Query for server state
- **Routing**: Client-side routing with React components
- **Real-time Updates**: WebSocket connections for live data

### Backend Architecture
- **Framework**: Express.js with TypeScript (ES Modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based auth with Passport.js
- **Real-time**: WebSocket server for live updates
- **API Integration**: External Goated.com API for leaderboard data

### Database Design
- **ORM**: Drizzle with type-safe schema definitions
- **Migrations**: Version-controlled schema migrations
- **Connection**: Neon serverless PostgreSQL
- **Structure**: Modular schema files organized by feature

## Key Components

### Data Services
- **GoatedApiService**: External API communication with retry logic
- **StatSyncService**: Data transformation and statistical operations
- **LeaderboardSyncService**: User data synchronization
- **ProfileService**: User profile and account linking management
- **RaceService**: Wager race operations and tracking

### Core Features
- **Leaderboard System**: Multi-timeframe wager tracking (daily, weekly, monthly, all-time)
- **Wager Races**: Monthly competitions with prize pools
- **Bonus Challenges**: Admin-managed promotional campaigns
- **Account Linking**: Goated.com account integration workflow
- **Admin Panel**: Comprehensive management interface

### Authentication & Authorization
- **User Authentication**: Session-based login system
- **Admin Access**: Separate admin authentication with special privileges
- **Rate Limiting**: Configurable rate limits across endpoints
- **Account Verification**: Email and Telegram verification workflows

## Data Flow

### Primary Data Pipeline
1. **External API Fetch**: GoatedApiService retrieves leaderboard data
2. **Data Transformation**: StatSyncService processes and normalizes data
3. **Database Sync**: LeaderboardSyncService updates user records
4. **Real-time Updates**: WebSocket broadcasts changes to connected clients
5. **UI Updates**: React Query invalidates cache and re-renders components

### User Profile Flow
1. **Profile Creation**: Users register with basic information
2. **Account Linking**: Optional Goated.com account connection
3. **Data Enrichment**: Profile enhanced with wager statistics
4. **Verification**: Email and Telegram verification processes

## External Dependencies

### APIs
- **Goated.com Referral API**: Source of truth for wager data
- **Authentication**: Bearer token-based API authentication
- **Rate Limiting**: Exponential backoff retry strategy

### Third-party Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Telegram Bot API**: Community management and notifications
- **Email Services**: User verification and notifications

### Key Packages
- **@neondatabase/serverless**: Database connectivity
- **@radix-ui/react-***: UI component library
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database operations
- **telegraf**: Telegram bot framework

## Deployment Strategy

### Environment Configuration
- **Development**: Vite dev server (port 5173) with Express API (port 5170)
- **Production**: Built static files served by Express server
- **WebSocket**: Dedicated WebSocket server on port 5000
- **Telegram Bot**: Separate service on port 5001

### Build Process
1. **Frontend Build**: Vite bundles React app to static files
2. **Backend Build**: esbuild compiles TypeScript to ESM
3. **Database Migration**: Drizzle pushes schema changes
4. **Asset Optimization**: Static assets optimized and served

### Replit Configuration
- **Modules**: Node.js 20, Web hosting, PostgreSQL 16
- **Ports**: Multiple port configuration for different services
- **Deployment**: Google Cloud Engine with automated builds

## Changelog
- June 15, 2025: **CRITICAL FIX**: Resolved leaderboard data sync failure by activating missing `syncLeaderboardUsers()` service and fixing schema mismatch - real-time wager data now flowing correctly across all timeframes
- June 14, 2025: Fixed wager data synchronization with valid API token - all leaderboard timeframes now updating correctly
- June 14, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.