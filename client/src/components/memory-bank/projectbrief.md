# GoatedVIPs Platform Project Brief

## Project Overview
GoatedVIPs is an independent platform created by an established Goated.com affiliate partner. The platform serves as a community hub for players referred under the GoatedVips affiliate code, offering enhanced statistics tracking, wager race participation, and exclusive rewards.

## Core Objectives
1. **Authentication System Optimization** - Streamline authentication logic, implement token refresh, and enhance security
2. **Profile System Refinement** - Improve user profile management, verification flow, and data presentation
3. **Admin System Security** - Enhance admin authentication, implement audit logging, and secure domain-specific routes
4. **Code Cleanup & Organization** - Remove redundancies, standardize patterns, and improve maintainability
5. **API System Architecture** - Implement two-service architecture for external API integration with improved resilience

## Key Components
- **Dual Domain Architecture**
  - goatedvips.gg: Public-facing application
  - goombas.net: Secure admin interface
- **Authentication System**
  - JWT-based authentication with refresh mechanism
  - Route protection across both domains
  - Role-based access control
- **Profile Management**
  - User verification workflow
  - Tier-based user categorization
  - Profile customization
- **Admin Tools**
  - User management interface
  - System analytics
  - API sync monitoring
- **API Architecture**
  - GoatedApiService for external API communication
  - PlatformApiService for internal endpoints
  - Scheduled data synchronization
  - Advanced error handling and retry logic

## Technical Stack
- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket for live updates
- **Deployment**: Replit hosting

## Development Approach
The development is structured in two phases:
1. **VS Code Phase (Current)**: Code cleanup, documentation, organization
2. **Replit Phase**: Implementation of advanced features, deployment, and optimization

## Success Criteria
- Clean, maintainable codebase with clear documentation
- Secure authentication and authorization flows
- Efficient profile and admin systems
- Optimized performance for core operations
- Resilient API integration with proper error handling
