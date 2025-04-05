# Loading Performance Optimization Guide

This document outlines the loading performance optimization strategies for the GoatedVIPs platform. These optimizations are meant to be implemented in Phase 2 (Replit) to significantly improve the user experience and application performance.

## Table of Contents

1. [React Query Optimization](#react-query-optimization)
2. [Asset Loading Optimization](#asset-loading-optimization)
3. [Component Rendering Optimization](#component-rendering-optimization)
4. [Server-Side Optimization](#server-side-optimization)
5. [Performance Metrics & Benchmarks](#performance-metrics-benchmarks)

## React Query Optimization

### Centralized QueryClient Configuration

Create a standardized QueryClient configuration with optimal defaults:

```typescript
// client/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

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
```

### Query Key Structure

Implement a consistent query key structure for better cache management:

```typescript
// Bad: Inconsistent query keys
useQuery({ queryKey: [`/users/${userId}`] });
useQuery({ queryKey: ['fetchUser', userId] });

// Good: Consistent, hierarchical query keys
useQuery({ queryKey: ['user', userId] });
useQuery({ queryKey: ['user', userId, 'stats'] });
```

### Custom Hooks for Query Logic

Create custom hooks to encapsulate and reuse query logic:

```typescript
// client/src/hooks/use-user.ts
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes for user data
    enabled: !!userId, // Only run when userId is available
  });
}

// Usage in components
const { data: user, isLoading } = useUser(userId);
```

### Parallel Queries

Run independent queries in parallel rather than sequentially:

```typescript
// Bad: Sequential queries
const { data: user } = useQuery(['user', userId]);
const { data: stats } = useQuery(
  ['userStats', userId],
  { enabled: !!user } // Only runs after user query completes
);

// Good: Parallel queries
const { data: user } = useQuery(['user', userId]);
const { data: stats } = useQuery(['userStats', userId]);
```

### Prefetching Critical Data

Prefetch data for likely navigation paths:

```typescript
// Prefetch user data when hovering over a user link
<Link 
  href={`/user/${userId}`}
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId)
    });
  }}
>
  View Profile
</Link>
```

## Asset Loading Optimization

### Image Optimization

Optimize image loading to prevent layout shifts:

```jsx
// Bad: Missing dimensions and loading attribute
<img 
  src="/images/profile.jpg" 
  alt="Profile" 
  className="w-full h-auto" 
/>

// Good: With dimensions and loading attribute
<img 
  src="/images/profile.jpg" 
  alt="Profile" 
  width="400" 
  height="300"
  loading="lazy" // For below-the-fold images
  className="w-full h-auto" 
/>
```

### Resource Hints

Add resource hints for critical assets:

```jsx
// Component to add resource hints
function ResourceHints() {
  useEffect(() => {
    // Preload critical images
    const preloadImage = (href) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      document.head.appendChild(link);
      return link;
    };
    
    // Preconnect to API domain
    const preconnect = (href) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      document.head.appendChild(link);
      return link;
    };
    
    const links = [
      preloadImage('/images/logo.png'),
      preloadImage('/images/hero-image.jpg'),
      preconnect('https://api.goatedvips.gg')
    ];
    
    return () => {
      links.forEach(link => document.head.removeChild(link));
    };
  }, []);
  
  return null;
}

// Add to App component
function App() {
  return (
    <>
      <ResourceHints />
      <Routes>
        {/* ... */}
      </Routes>
    </>
  );
}
```

### Code Splitting

Implement code splitting to reduce initial bundle size:

```jsx
// Before: Direct import
import { UserProfile } from './UserProfile';

// After: Dynamic import with React.lazy
const UserProfile = React.lazy(() => import('./UserProfile'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <UserProfile userId={userId} />
</Suspense>
```

## Component Rendering Optimization

### Skeleton Loaders

Create skeleton loaders for async content:

```jsx
// Create reusable skeleton components
const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-24 bg-[#242530] rounded-xl mb-4"></div>
    <div className="h-12 w-1/3 bg-[#242530] rounded-lg mb-2"></div>
    <div className="h-4 bg-[#242530] rounded-md mb-1"></div>
    <div className="h-4 bg-[#242530] rounded-md"></div>
  </div>
);

// Use with conditional rendering
{isLoading ? (
  <ProfileSkeleton />
) : (
  <ProfileContent user={user} />
)}

// Or with Suspense
<Suspense fallback={<ProfileSkeleton />}>
  <ProfileContent />
</Suspense>
```

### Windowing for Long Lists

Use virtualization for long lists of data:

```jsx
import { FixedSizeList } from 'react-window';

const LeaderboardList = ({ items }) => (
  <FixedSizeList
    height={500}
    width="100%"
    itemCount={items.length}
    itemSize={70}
  >
    {({ index, style }) => (
      <div style={style}>
        <LeaderboardItem item={items[index]} rank={index + 1} />
      </div>
    )}
  </FixedSizeList>
);
```

### Memoization

Memoize expensive computations and components:

```jsx
// Memoize expensive calculations
const getWagerStats = useMemo(() => {
  // Complex calculation here
  return calculateWagerStats(user.wagers);
}, [user.wagers]);

// Memoize components that don't need frequent re-renders
const UserCard = React.memo(function UserCard({ user }) {
  return (
    <div className="card">
      <h3>{user.username}</h3>
      {/* ... */}
    </div>
  );
});
```

## Server-Side Optimization

### Redis Caching

Implement Redis caching for frequently accessed data:

```typescript
// server/middleware/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cacheMiddleware = (ttl = 60) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original send method
      const originalSend = res.send;
      
      // Override send method to cache response before sending
      res.send = function(body) {
        try {
          redis.set(key, body, 'EX', ttl);
        } catch (err) {
          console.error('Cache error:', err);
        }
        return originalSend.call(this, body);
      };
      
      next();
    } catch (err) {
      console.error('Cache error:', err);
      next();
    }
  };
};

// Apply to routes
app.use('/api/leaderboard', cacheMiddleware(300)); // 5 minute cache
```

### Database Indexes

Add indexes for frequently queried fields:

```typescript
// db/schema/users.ts
import { pgTable, text, index } from 'drizzle-orm/pg-core';

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
```

### Batch Operations

Implement batching for multiple related operations:

```typescript
// server/services/userService.ts
export async function processBulkUserUpdates(updates) {
  // Start a transaction
  return db.transaction(async (tx) => {
    const results = [];
    
    for (const update of updates) {
      const result = await tx.update(users)
        .set(update.data)
        .where(eq(users.id, update.id))
        .returning();
      
      results.push(result[0]);
    }
    
    return results;
  });
}
```

## Performance Metrics & Benchmarks

### Client-Side Metrics

Monitor these metrics to ensure optimal performance:

| Metric | Target | Description |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.8s | Time until first content is displayed |
| Largest Contentful Paint (LCP) | < 2.5s | Time until largest content element is displayed |
| Time to Interactive (TTI) | < 3.5s | Time until page is fully interactive |
| Cumulative Layout Shift (CLS) | < 0.1 | Measure of visual stability |
| First Input Delay (FID) | < 100ms | Time from first interaction to response |

### Server-Side Metrics

Monitor these server-side metrics:

| Metric | Target | Description |
|--------|--------|-------------|
| API Response Time | < 200ms | Average time to respond to API requests |
| Database Query Time | < 100ms | Average time for database queries |
| Memory Usage | < 512MB | Server memory consumption |
| CPU Usage | < 50% | Server CPU utilization under load |
| Error Rate | < 0.1% | Percentage of failed requests |

### Monitoring Implementation

Add performance monitoring with custom hooks:

```typescript
// client/src/hooks/use-performance.ts
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Report Web Vitals
    const reportWebVitals = ({ name, delta, id }) => {
      console.log(`Metric: ${name} ID: ${id} Value: ${delta}`);
      // In production, send to analytics
    };
    
    // Register performance observers
    const perfObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        reportWebVitals({
          name: entry.name,
          delta: entry.startTime,
          id: entry.id
        });
      }
    });
    
    // Observe different types of performance entries
    perfObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    perfObserver.observe({ type: 'first-input', buffered: true });
    perfObserver.observe({ type: 'layout-shift', buffered: true });
    
    return () => {
      perfObserver.disconnect();
    };
  }, []);
}

// Add to App component
function App() {
  usePerformanceMonitoring();
  return (
    // ...
  );
}
```

## Implementation Checklist

Use this checklist when implementing loading performance optimizations:

- [ ] Set up centralized QueryClient with optimal defaults
- [ ] Convert to consistent query key structure 
- [ ] Create custom query hooks for shared data fetching logic
- [ ] Optimize parallel data fetching where appropriate
- [ ] Add prefetching for anticipated user navigation
- [ ] Add proper dimensions and loading attributes to images
- [ ] Implement resource hints for critical assets
- [ ] Add code splitting for large components
- [ ] Create skeleton loaders for async content
- [ ] Implement windowing for long lists
- [ ] Memoize expensive components and calculations
- [ ] Add Redis caching for API responses
- [ ] Implement database indexes on frequently queried columns
- [ ] Add batch operations for multiple database updates
- [ ] Set up performance monitoring

Implementing these optimizations will significantly improve the loading performance of the GoatedVIPs platform, resulting in a better user experience and higher user engagement.
