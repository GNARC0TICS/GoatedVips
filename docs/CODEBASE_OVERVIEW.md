
# GoatedVIPs Platform Codebase Overview

## Core Architecture

The GoatedVIPs platform is built on a modern, scalable architecture:

- **Frontend**: React with TypeScript, TailwindCSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket for live updates
- **Authentication**: JWT + Session-based authentication
- **Deployment**: Replit hosting

### Domain Architecture

The platform now operates on two distinct domains:
- **goatedvips.gg**: Public-facing application
- **goombas.net**: Secure admin interface

This separation provides enhanced security and a dedicated administrative experience.

## Key Components

### 1. Domain Routing System

#### Current Implementation
- Domain detection middleware (`domain-handler.ts`)
- Domain-specific routing middleware (`domain-router.ts`)
- Client-side domain utilities (`domain-utils.ts`)

#### Code Examples
```typescript
// Server-side domain detection
app.use(domainRedirectMiddleware);

// Domain-specific middleware
adminDomainOnly - Restricts routes to Goombas.net
publicDomainOnly - Restricts routes to GoatedVIPs.gg

// Client-side domain detection
export const isAdminDomain = (): boolean => {
  return window.location.hostname === 'goombas.net' || 
         window.location.hostname.includes('goombas.net');
};
```

### 2. Admin Interface

#### Current Implementation
- Dedicated entry point (`client/src/admin.tsx`)
- Admin-specific authentication
- Protected admin routes
- Enhanced security measures
- Domain-specific API endpoints

#### Code Examples
```typescript
// Admin login endpoint
router.post('/goombas.net/login', async (req, res) => {
  // Authenticate admin credentials
});

// Admin dashboard
export default function GoombasAdminDashboard() {
  // Admin dashboard implementation
}
```

### 3. API Synchronization System

#### Current State
- Optimized API synchronization logic
- Metadata tracking for sync operations
- Partial and full sync capabilities
- Performance optimizations

#### Required Improvements
1. Enhance error handling in sync process
2. Improve logging of sync operations
3. Add retry mechanisms for failed syncs
4. Develop admin interface for sync monitoring

#### WebSocket Implementation
- **Current State**: Partially implemented
- **Issues**:
  - Connection stability in high-load scenarios
  - Reconnection logic needs improvement
  - Missing heartbeat mechanism
  
#### Required Improvements:
```typescript
// Implement in server/index.ts
const HEARTBEAT_INTERVAL = 30000;
const RECONNECT_TIMEOUT = 5000;

wss.on('connection', (ws) => {
  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, HEARTBEAT_INTERVAL);

  ws.on('close', () => clearInterval(heartbeat));
});
```

### 4. Authentication Flow

#### Current Implementation
- JWT-based authentication
- Telegram verification
- Session management
- Domain-specific authentication

#### Known Issues
1. Token refresh mechanism incomplete
2. Missing password reset flow
3. Session cleanup not implemented

#### Required Fixes:
1. Implement token refresh endpoint
2. Add password reset flow with email verification
3. Set up session cleanup cron job

### 5. Data Transformation Pipeline

#### Current State
- Basic transformation implemented
- Caching layer missing
- Error handling needs improvement

#### Required Improvements:
1. Add Redis caching layer
2. Implement retry mechanism
3. Add detailed error logging
4. Optimize transformation algorithms

### 6. Admin Dashboard

#### Current Features
- User management
- Race configuration
- System analytics
- API sync monitoring

#### Missing Features
1. Bulk operations for user management
2. Advanced analytics dashboard
3. Audit logging system
4. Performance monitoring tools

## Code Organization

### Frontend Structure
```
client/
  ├── src/
  │   ├── components/      # Reusable UI components
  │   ├── hooks/           # Custom React hooks
  │   ├── lib/             # Utility functions
  │   ├── pages/           # Page components
  │   │   ├── admin/       # Admin pages
  │   ├── styles/          # CSS and styling
  │   ├── App.tsx          # Main application
  │   └── admin.tsx        # Admin application
```

### Backend Structure
```
server/
  ├── config/              # Configuration files
  ├── middleware/          # Express middleware
  │   ├── domain-handler.ts # Domain detection
  │   ├── domain-router.ts  # Domain routing
  ├── routes/              # API endpoints
  │   ├── goombas-admin.ts  # Admin-specific routes
  ├── tests/               # Test files
  ├── types/               # TypeScript type definitions
  ├── utils/               # Utility functions
  └── index.ts             # Server entry point
```

### Testing Requirements
1. Unit tests for core functionality
2. Integration tests for API endpoints
3. E2E tests for critical flows
4. Performance testing suite

## Immediate Action Items

### High Priority
1. Fix WebSocket reconnection logic
2. Implement token refresh mechanism
3. Add missing database indexes
4. Enhance error handling
5. Improve domain routing security

### Medium Priority
1. Implement caching layer
2. Add audit logging
3. Enhance admin dashboard
4. Improve monitoring
5. Optimize API sync process

### Low Priority
1. Implement advanced analytics
2. Add bulk operations
3. Enhance documentation
4. Optimize asset delivery

## Code Quality Guidelines

### TypeScript Best Practices
1. Use strict type checking
2. Implement proper interfaces
3. Avoid any type
4. Use proper error types

### React Component Structure
1. Implement proper error boundaries
2. Use React.memo for optimization
3. Implement proper prop types
4. Follow component composition patterns

## Monitoring & Debugging

### Required Tools
1. Error tracking system
2. Performance monitoring
3. API analytics
4. User behavior tracking

### Implementation Priority
1. Set up basic error tracking
2. Implement performance monitoring
3. Add user analytics
4. Set up alerting system

This overview provides a comprehensive look at the current state of the codebase and required improvements. Follow the priority order for implementations to ensure systematic improvement of the platform.
