# GoatedVIPs Platform - Replit Agent Guide

## 📋 Overview

This guide outlines the current state of the GoatedVIPs platform and serves as a roadmap for Phase 2 implementation on Replit. We've completed code cleanup and organization in Phase 1, and this document will help you understand what's been done and what still needs to be implemented.

## ✅ Completed Tasks (Phase 1)

### Authentication System
- ✅ Created centralized `authService` for both client and server
- ✅ Refactored authentication hooks to use the centralized service
- ✅ Documented authentication flow and protected routes
- ✅ Improved error handling for authentication failures

### Profile System
- ✅ Created centralized `profileService` for profile-related operations
- ✅ Implemented proper typing for user profiles
- ✅ Documented profile data fetching and visualization
- ✅ Organized profile verification flow

### Code Organization
- ✅ Created services directory structure for both client and server
- ✅ Added comprehensive documentation to core files
- ✅ Separated business logic from components and routes
- ✅ Implemented standardized error handling

## 🔄 Current State

### Architecture
- The platform uses a React frontend with Express.js backend
- Database access is handled through Drizzle ORM
- Authentication uses JWT tokens with HTTP-only cookies
- Domain-specific routing separates admin and public interfaces

### Known Issues
1. Missing token refresh mechanism
2. Incomplete email verification flow
3. Basic admin credential management (environment variables)
4. Redundant profile components

## ⏭️ Phase 2 Tasks (Replit Implementation)

### High Priority

#### 1. Authentication Enhancement
- Implement JWT token refresh mechanism
- Add proper session management
- Implement rate limiting for auth endpoints
- Add account lockout after failed attempts
```typescript
// TODO: Replit Phase 2
// Implement token refresh endpoint
router.post("/api/refresh-token", async (req, res) => {
  // Validate refresh token
  // Generate new access token
  // Return new token pair
});
```

#### 2. Email Verification Flow
- Complete email verification endpoints
- Implement verification token generation
- Create client-side verification UI
```typescript
// TODO: Replit Phase 2
// Implement email verification flow
// Use the template in server/templates/verification-email.ts
```

#### 3. Admin Security
- Implement proper credential storage with hashing
- Add audit logging middleware
- Enhance admin access protection
```typescript
// TODO: Replit Phase 2
// Implement admin audit logging
app.use("/api/admin/*", auditLoggingMiddleware);
```

### Medium Priority

#### 1. Caching Layer
- Implement Redis caching for frequently accessed data
- Add cache invalidation logic
- Configure cache timeouts based on data type
```typescript
// TODO: Replit Phase 2
// Implement caching middleware
const cache = new RedisCache();
app.use("/api/leaderboard", cacheMiddleware(cache, 60)); // 60 second cache
```

#### 2. Profile Component Optimization
- Consolidate overlapping profile components
- Implement proper data loading states
- Add error boundaries for profile data

#### 3. Database Indexing
- Add indexes for frequently queried fields
- Optimize query performance for user lookups
- Add indexes on `goated_id` and `telegram_id`

### Low Priority

#### 1. WebSocket Enhancements
- Implement WebSocket heartbeats
- Add connection pooling
- Implement auto-reconnection logic

#### 2. Frontend Optimizations
- Implement React.memo for expensive components
- Add skeleton loaders for data-dependent components
- Optimize bundle size

## 🔍 Redundancies & Inefficiencies

### Redundant Code
1. Multiple implementations of authentication checks
2. Duplicated profile data fetching across components
3. Repeated validation logic in routes

### Inefficient Patterns
1. Direct database queries in route handlers (should use services)
2. No caching for frequent queries
3. Missing batch operations for admin tasks

## 🛠️ Environment Setup

### Required Environment Variables
```
JWT_SECRET=your-jwt-secret
ADMIN_USERNAME=admin-username
ADMIN_PASSWORD=admin-password
ADMIN_SECRET_KEY=admin-secret-key
```

### Database Configuration
```
DATABASE_URL=your-database-url
```

### Email Configuration (for verification)
```
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

## 🚀 Deployment Checklist

1. Set up environment variables in Replit
2. Run database migrations
3. Build and deploy frontend
4. Set up domain mapping for both domains
5. Configure environment for proper domain handling

## 📈 Performance Optimization Guide

1. Add DB indexes on frequently queried columns
2. Implement Redis caching for API responses
3. Use connection pooling for database
4. Implement proper error handling and logging
5. Configure proper CORS and security headers

## 📝 Note on Security

The security of the platform relies heavily on:
1. Domain separation (admin vs public)
2. Proper JWT handling
3. Input validation
4. Role-based access control

Ensure all security measures are properly implemented before going live.
