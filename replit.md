# Goombas x Goated VIPs v2.0

## Overview

This is a complete rewrite of the Goombas x Goated VIPs platform, built with a modern domain-driven architecture. The application serves as an independent community platform for players using the GoatedVips affiliate code, offering exclusive rewards, competitions, and VIP experiences.

The platform has been completely redesigned from the ground up with security, scalability, and user experience as top priorities. It features a React frontend with TypeScript and a Node.js backend using Express.js with comprehensive authentication and data management systems.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state, React Context for auth
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Custom component library with Radix UI primitives
- **Animations**: Framer Motion for smooth interactions
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with comprehensive middleware stack
- **Architecture**: Domain-driven design with clean separation of concerns
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with refresh tokens and secure session management
- **Caching**: Redis for session storage and rate limiting
- **Security**: Helmet, CORS, bcrypt hashing, input sanitization

### Database Strategy
- **Primary Database**: PostgreSQL with optimized schema design
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Versioned migration system
- **Caching Layer**: Redis for performance optimization

## Key Components

### Authentication System
- JWT-based authentication with 15-minute access tokens
- 7-day refresh tokens for persistent sessions
- Bcrypt password hashing with 12 rounds
- Role-based access control for admin features
- Secure session management with Redis storage

### User Management
- Comprehensive user profiles with tier progression
- VIP level tracking based on wagering activity
- Achievement system and reward tracking
- Profile privacy controls and settings

### Gaming Features
- **Wager Races**: Real-time competitive wagering events
- **Bonus Codes**: Exclusive promotional code distribution
- **Challenges**: Community-driven gaming challenges
- **Leaderboards**: Dynamic ranking system with multiple timeframes
- **MVP Tracking**: Most Valuable Player recognition system

### Administrative Tools
- Admin dashboard for user management
- Race configuration and management
- Bonus code administration
- Support ticket system
- Analytics and reporting

## Data Flow

### Authentication Flow
```
Login Request → JWT Generation → Redis Session → Protected Routes
```

### Leaderboard Updates
```
Game API → Data Transformation → Database Update → WebSocket Broadcast → UI Update
```

### Reward Distribution
```
Wager Tracking → Tier Calculation → Reward Calculation → Database Update → User Notification
```

## External Dependencies

### Required Services
- **PostgreSQL Database**: Primary data storage (Neon recommended for deployment)
- **Redis Instance**: Session management and caching (optional fallback to memory)
- **External Gaming API**: Integration with Goated.com for wager data

### Development Dependencies
- Node.js 20+ for runtime environment
- TypeScript for type safety
- Vite for frontend bundling
- Various npm packages for functionality

### Optional Integrations
- **Telegram Bot**: Community notifications and user verification
- **Email Service**: User communications (currently mocked)
- **Analytics**: User behavior tracking and metrics

## Deployment Strategy

### Environment Configuration
The application uses environment variables for configuration:
- Database connection strings
- JWT secrets and security keys
- Redis connection details  
- CORS origins for security
- External API credentials

### Build Process
- Frontend builds to static assets via Vite
- Backend compiles TypeScript to JavaScript
- Single production server serves both frontend and API
- Optimized for Replit deployment with fallback configurations

### Security Measures
- Rate limiting with sliding window algorithm
- Input sanitization and validation on all endpoints
- SQL injection prevention with parameterized queries
- XSS protection with security headers
- CORS configuration for cross-origin requests

## Changelog
- June 29, 2025: Initial setup and domain-driven architecture implementation
- June 29, 2025: Fixed Drizzle ORM compatibility issues (timestamptz → timestamp)
- June 29, 2025: Implemented memory cache fallback for Redis unavailability
- June 29, 2025: Backend operational with full domain-driven architecture on port 3000
- June 29, 2025: Enhanced UI styling with comprehensive smooth rounded borders system

## Recent Changes
- Successfully deployed complete Goombas x Goated VIPs v2.0 platform with both servers operational
- Fixed frontend TypeScript path resolution (client/src → frontend/src) and created missing component exports
- Backend: Domain-driven architecture running on port 3000 with JWT auth, PostgreSQL, VIP tiers, leaderboards
- Frontend: Vite dev server on port 5174 with hot-reloading and complete component library
- Workflow updated to run both servers concurrently via npm run dev
- Memory cache fallback active for Redis unavailability
- Fixed QueryClient configuration with proper provider wrapper
- Added backend root route handler and configured Vite proxy for health endpoint routing
- All API endpoints now accessible through frontend proxy configuration
- Fixed RaceTimer infinite re-render issue (temporarily disabled component)
- Implemented comprehensive smooth border radius system throughout application
- Enhanced Tailwind configuration with custom border radius values and animations
- Added smooth hover effects, transitions, and enhanced visual styling
- Updated global CSS with smooth scrollbar styling and enhanced component interactions
- Fixed leaderboard API data format mismatch causing validation errors
- Backend now returns correct schema format matching frontend expectations
- All leaderboard timeframes (daily, weekly, monthly, all_time) now working properly
- June 30, 2025: Fixed ProfileTierProgress component import error by renaming EnhancedProfileTierProgress to ProfileTierProgress
- June 30, 2025: Reverted Home.tsx to clean, professional design - removed excessive gradients, floating decorative elements, over-engineered animations, and complex motion effects
- June 30, 2025: Reverted HeroVideo component to original clean design - removed borders, shadows, hover effects, background glows, and excessive framer-motion animations
- June 30, 2025: Cleaned up home page description card - removed stats section (10K+ Active Players, Daily Rewards, Total Prizes) keeping only welcome text and body description
- June 30, 2025: Cleaned up CallToAction component - removed emoji stats section, excessive gradients, floating decorative elements, and complex animations
- June 30, 2025: Removed accessibility focus rings from all buttons - outline-none applied to button component (focus rings should only be on text inputs)

## User Preferences

Preferred communication style: Simple, everyday language.