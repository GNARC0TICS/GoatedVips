# GoatedVIPs Platform - Enhanced Replit Agent Guide

## 📋 Overview

This guide outlines the current state of the GoatedVIPs platform and serves as a comprehensive roadmap for Phase 2 implementation on Replit. Phase 1 (VS Code) focused on code cleanup and architecture improvements. Phase 2 (Replit) will focus on performance optimization, security enhancements, and feature completion.

## 🚀 Getting Started on Replit

1. **First Steps**
   - Review the Memory Bank files in order: `projectbrief.md` → `productContext.md` → `systemPatterns.md` → `techContext.md` → `activeContext.md` → `progress.md`
   - Update the Memory Bank with any initial observations or discoveries
   - Check environment variables and ensure they're properly configured

2. **Environment Setup**
   ```
   JWT_SECRET=your-jwt-secret
   ADMIN_USERNAME=admin-username
   ADMIN_PASSWORD=admin-password
   ADMIN_SECRET_KEY=admin-secret-key
   DATABASE_URL=your-database-url
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your-email
   EMAIL_PASS=your-password
   ```

## ✅ Completed Tasks (Phase 1)

### Architecture & Organization
- ✅ Created service layer for both client and server
- ✅ Separated business logic from components and routes
- ✅ Implemented standardized error handling
- ✅ Created style and animation standards

### Authentication System
- ✅ Created centralized `authService` for both client and server
- ✅ Refactored authentication hooks to use the centralized service
- ✅ Implemented proper protected route handling
- ✅ Prepared token refresh architecture

### Profile System
- ✅ Created centralized `profileService` for profile-related operations
- ✅ Implemented proper typing for user profiles
- ✅ Added profile ownership checks
- ✅ Standardized profile data fetching

### UI Optimization
- ✅ Created centralized style constants
- ✅ Implemented animation presets
- ✅ Added accessibility enhancements
- ✅ Enhanced component interfaces with TypeScript

## 🔍 Current State Analysis

### Architecture Overview
- React frontend with Express.js backend
- Database access through Drizzle ORM
- JWT authentication with HTTP-only cookies
- Domain-specific routing separates admin and public interfaces

### Known Issues & Inefficiencies
1. **Authentication System**
   - Missing token refresh mechanism
   - No rate limiting for login attempts
   - Missing session cleanup functions

2. **Loading Performance**
   - Inefficient React Query configurations
   - Unoptimized image loading
   - Missing Suspense boundaries
   - No skeleton loaders for async content

3. **Data Access Patterns**
   - Redundant API calls from multiple components
   - No caching for frequently accessed data
   - Inefficient query patterns

4. **Admin & Security**
   - Basic credential storage (environment variables)
   - Missing audit logging
   - Incomplete admin UI for user management

## ⚡️ Phase 2 Tasks (Priority Order)

### 1. Performance Optimization

#### React Query Enhancement
```typescript
// Create a centralized queryClient configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Refactor components to use proper query keys & options
const { data, isLoading } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // Override default for user data
});
```

#### Image & Asset Optimization
```jsx
// Add proper loading attributes and dimensions
<img 
  src="/images/logo.png" 
  alt="Logo" 
  width="200" 
  height="80"
  loading="lazy" 
  className="h-8 w-auto" 
/>

// Preload critical resources
useEffect(() => {
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'image';
  preloadLink.href = '/images/hero-image.png';
  document.head.appendChild(preloadLink);
  
  return () => {
    document.head.removeChild(preloadLink);
  };
}, []);
```

#### Implement Suspense & Skeletons
```jsx
// Add Suspense boundaries
<Suspense fallback={<ProfileSkeleton />}>
  <ProfileContent />
</Suspense>

// Create skeleton loaders
const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-24 bg-gray-200 rounded-md mb-4"></div>
    <div className="h-8 w-1/3 bg-gray-200 rounded-md mb-2"></div>
    <div className="h-4 bg-gray-200 rounded-md mb-1"></div>
    <div className="h-4 bg-gray-200 rounded-md"></div>
  </div>
);
```

#### Add Server-Side Caching
```typescript
// Implement Redis caching middleware
const cacheMiddleware = (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  
  redis.get(key, (err, data) => {
    if (data) {
      return res.json(JSON.parse(data));
    }
    
    const originalSend = res.send;
    res.send = function(body) {
      redis.set(key, body, 'EX', 60); // 60 second cache
      originalSend.call(this, body);
    };
    
    next();
  });
};

// Apply to specific routes
app.use("/api/leaderboard", cacheMiddleware);
```

### 2. Authentication Enhancement

#### Implement Token Refresh
```typescript
// Client-side token refresh
export const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Refresh failed');
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Auto-refresh setup
const setupTokenRefresh = () => {
  // Refresh 1 minute before expiration
  const refreshTime = (tokenExpiration - 60) * 1000;
  const now = Date.now();
  const timeUntilRefresh = refreshTime - now;
  
  if (timeUntilRefresh <= 0) {
    refreshToken();
    return;
  }
  
  setTimeout(() => refreshToken(), timeUntilRefresh);
};
```

#### Add Rate Limiting
```typescript
// Server-side rate limiting
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  message: { error: 'Too many login attempts, please try again later' }
});

app.use('/api/login', authLimiter);
```

#### Implement Account Lockout
```typescript
// Track failed attempts and implement lockout
const loginAttempts = new Map();

app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  const userKey = `login:${username}`;
  
  // Check if account is locked
  if (loginAttempts.get(userKey)?.attempts >= 5) {
    const lockTime = loginAttempts.get(userKey).lockUntil;
    if (Date.now() < lockTime) {
      return res.status(429).json({ 
        error: 'Account temporarily locked due to too many failed attempts' 
      });
    }
    // Reset after lockout period
    loginAttempts.delete(userKey);
  }
  
  // Attempt login
  try {
    // Verify credentials
    // If successful, clear attempts and continue
    loginAttempts.delete(userKey);
    // Return success response
  } catch (error) {
    // Failed login
    const attempts = (loginAttempts.get(userKey)?.attempts || 0) + 1;
    const lockUntil = attempts >= 5 ? Date.now() + (30 * 60 * 1000) : 0;
    
    loginAttempts.set(userKey, { attempts, lockUntil });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

### 3. Email Verification Implementation

```typescript
// Generate verification token
const generateVerificationToken = (userId: string): string => {
  const payload = { userId, type: 'email_verification' };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Send verification email
const sendVerificationEmail = async (user: User): Promise<boolean> => {
  const token = generateVerificationToken(user.id);
  const verificationUrl = `https://goatedvips.gg/verify?token=${token}`;
  
  const template = require('../templates/verification-email').getTemplate({
    username: user.username,
    verificationUrl
  });
  
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your GoatedVIPs account',
      html: template
    });
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
};

// Verification endpoint
app.get('/api/verify', async (req, res) => {
  const { token } = req.query;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }
    
    // Update user verification status
    await db.update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, decoded.userId));
      
    return res.redirect('/verification-success');
  } catch (error) {
    console.error('Verification failed:', error);
    return res.redirect('/verification-failed');
  }
});
```

### 4. Admin System Enhancement

#### Implement Audit Logging
```typescript
// Audit logging middleware
const auditLoggingMiddleware = (req, res, next) => {
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const user = req.user;
    const action = req.method + ' ' + req.path;
    const timestamp = new Date().toISOString();
    const status = res.statusCode;
    
    // Log to database or file
    db.insert(adminLogs).values({
      userId: user?.id || 'anonymous',
      action,
      timestamp,
      status,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }).execute();
    
    originalEnd.apply(this, args);
  };
  
  next();
};

// Apply to admin routes
app.use('/api/admin', auditLoggingMiddleware);
```

#### Enhanced Admin UI
```jsx
// Admin user management component
const UserManagement = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => fetchUsers()
  });
  
  // Bulk actions with optimistic updates
  const bulkActionMutation = useMutation({
    mutationFn: (action) => performBulkAction(action),
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin', 'users'] });
      
      // Snapshot previous value
      const previousUsers = queryClient.getQueryData(['admin', 'users']);
      
      // Optimistically update UI
      queryClient.setQueryData(['admin', 'users'], (old) => 
        updateUsersOptimistically(old, variables)
      );
      
      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // Revert on error
      queryClient.setQueryData(['admin', 'users'], context.previousUsers);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    }
  });
  
  return (
    <div>
      <h1>User Management</h1>
      <BulkActionBar onAction={(action) => bulkActionMutation.mutate(action)} />
      
      {isLoading ? (
        <UserListSkeleton />
      ) : (
        <UserList 
          users={data} 
          isUpdating={bulkActionMutation.isLoading} 
        />
      )}
    </div>
  );
};
```

### 5. Database Optimization

```typescript
// Add indexes to the schema
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  goatedId: text('goated_id').notNull().default(''),
  telegramId: text('telegram_id'),
  username: text('username').notNull(),
  email: text('email').notNull(),
  // ... other fields
}, (table) => {
  return {
    goatedIdIdx: index('goated_id_idx').on(table.goatedId),
    telegramIdIdx: index('telegram_id_idx').on(table.telegramId),
    usernameIdx: index('username_idx').on(table.username)
  };
});

// Add composite indexes for complex queries
export const userStats = pgTable('user_stats', {
  userId: text('user_id').notNull().references(() => users.id),
  statDate: date('stat_date').notNull(),
  wagered: decimal('wagered', { precision: 16, scale: 8 }).notNull().default('0'),
  // ... other fields
}, (table) => {
  return {
    userDateIdx: index('user_date_idx').on(table.userId, table.statDate),
  };
});
```

## 🔄 Memory Bank Updates

As you complete each phase of the implementation, make sure to update the Memory Bank files accordingly:

1. **Update activeContext.md**
   - Document current focus and recent changes
   - Update the challenges and next steps sections

2. **Update progress.md**
   - Check off completed tasks
   - Add new tasks as they're identified
   - Document any issues encountered

3. **Update systemPatterns.md**
   - Document new patterns implemented
   - Update diagrams if needed
   - Add code examples for new patterns

4. **Testing & Documentation**
   - Add unit tests for new functionality
   - Document API endpoints in the appropriate files
   - Update user-facing documentation

## 🚨 Troubleshooting Common Issues

1. **JWT Authentication Issues**
   - Check token expiration time
   - Verify HTTP-only cookie configuration
   - Check for CORS issues with credentials

2. **Database Connection Problems**
   - Verify connection string format
   - Check for connection pool exhaustion
   - Test queries directly against the database

3. **React Query Issues**
   - Verify query keys are consistent
   - Check staleTime and cacheTime settings
   - Monitor React Query DevTools for unexpected behavior

## 📊 Performance Verification

After implementing optimizations, verify improvement with these metrics:

1. **Client Performance**
   - First Contentful Paint (FCP) < 1.8s
   - Time to Interactive (TTI) < 3.5s
   - Largest Contentful Paint (LCP) < 2.5s
   - Cumulative Layout Shift (CLS) < 0.1

2. **Server Performance**
   - API response time < 200ms for critical endpoints
   - Database query time < 100ms for common queries
   - Memory usage < 512MB under load
   - CPU usage < 50% under normal conditions

## 🔐 Security Checklist

Ensure all security measures are properly implemented before deployment:

1. **Authentication**
   - Proper JWT handling with refresh mechanism
   - Rate limiting for authentication endpoints
   - Password hashing with proper algorithms

2. **Authorization**
   - Role-based access control for all routes
   - Proper domain separation for admin functions
   - Audit logging for sensitive operations

3. **Data Protection**
   - Input validation with Zod schemas
   - Output sanitization to prevent data leakage
   - Proper error handling to prevent information disclosure

4. **Network Security**
   - Configured CORS settings
   - HTTPS enforcement
   - Proper security headers (CSP, HSTS, etc.)

---

Remember: This guide is a living document. Update it as you progress through Phase 2 implementation to capture new insights and solutions. The Memory Bank should always reflect the most up-to-date understanding of the system.
