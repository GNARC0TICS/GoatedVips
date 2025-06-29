# Replit.md - Goombas x Goated VIPs v2.0

## Overview

This is a comprehensive web application built for Goombas x Goated VIPs v2.0 - a community platform for VIP casino players. The application serves as an independent platform created by an affiliate partner for players using the GoatedVips affiliate code. It features a modern, secure architecture with domain-driven design principles.

The platform provides:
- User authentication and profile management
- VIP tier tracking and progression
- Wager race competitions with real-time leaderboards
- Bonus code distribution system
- Telegram bot integration
- Admin management tools

## System Architecture

The application follows a full-stack architecture with complete separation between frontend and backend:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth user experiences
- **UI Components**: Custom components built on Radix UI primitives

### Backend Architecture  
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with domain-driven design
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis for sessions and rate limiting
- **Authentication**: JWT with refresh tokens (15min access, 7 days refresh)
- **Security**: Comprehensive security with Helmet, CORS, rate limiting, input validation

## Key Components

### Domain Layer
- **User Service**: Handles user management, authentication, and profile operations
- **VIP Tier System**: Manages tier progression based on wagering activity
- **Wager Race Service**: Real-time competition tracking and leaderboards
- **Bonus Code Service**: Distribution and management of exclusive codes

### Infrastructure Layer
- **Authentication**: JWT-based auth with bcrypt password hashing (12 rounds)
- **Database**: PostgreSQL with connection pooling and migration system
- **Cache**: Redis for session storage and rate limiting
- **Logging**: Structured logging with different levels for development/production
- **Monitoring**: Prometheus metrics collection for performance tracking

### API Layer
- **REST Endpoints**: Type-safe API routes with Zod validation
- **Middleware**: Authentication, rate limiting, input sanitization
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Frontend Components
- **Layout System**: Responsive navigation with mobile-first design
- **Data Visualization**: Real-time leaderboards and statistics
- **Profile Management**: Enhanced user profiles with tier visualization
- **Authentication UI**: Secure login/register flows with form validation

## Data Flow

```
User Request → Express Middleware → Domain Services → Database/Cache → Response
                     ↓
              Authentication → JWT Validation → User Context
                     ↓
              Rate Limiting → Redis Check → Request Processing
                     ↓
              Input Validation → Zod Schemas → Sanitized Data
```

### Real-time Updates
- WebSocket integration for live leaderboard updates
- React Query for optimistic updates and cache management
- Redis pub/sub for cross-service communication

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL (cloud-hosted)
- **Cache**: Redis (optional - falls back to memory store)
- **Email**: Mock service (production-ready interface for real providers)

### Third-party Integrations
- **Goated.com API**: For fetching user wagering data and statistics
- **Telegram Bot**: For user verification and notifications
- **Payment Processing**: Ready for crypto payment integration

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **ESLint + Prettier**: Code quality and formatting
- **Vitest**: Testing framework for unit and integration tests
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Development
- **Frontend**: Vite dev server on port 5174
- **Backend**: tsx with hot reload on port 3000
- **Concurrent Development**: Both servers run simultaneously with proxy setup

### Production Build
- **Frontend**: Static build optimized for CDN deployment
- **Backend**: Compiled TypeScript bundle for Node.js runtime
- **Assets**: Optimized images and fonts with proper caching headers

### Environment Configuration
- **Local**: SQLite/PostgreSQL + optional Redis
- **Production**: Neon PostgreSQL + Redis Cloud
- **Security**: Environment-based secrets management

### Scaling Considerations
- Horizontal scaling ready with stateless design
- Database connection pooling configured
- Redis clustering support for high availability
- CDN-ready static asset optimization

## Changelog

- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.