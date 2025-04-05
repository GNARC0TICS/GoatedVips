# GoatedVIPs Platform - Phase 3 Implementation Guide

## 📋 Overview

This guide outlines the advanced optimization and security enhancements for the GoatedVIPs platform. Phase 3 builds upon the foundation established in Phases 1 and 2, focusing on admin security, server-side performance, database optimization, and advanced frontend techniques.

## 🚀 Prerequisites

Before starting Phase 3, ensure that:
1. All Phase 2 implementation tasks are complete
2. The Memory Bank files are up to date with Phase 2 changes
3. All automated tests are passing
4. Performance metrics meet the Phase 2 targets

## 🔍 Phase 3 Focus Areas

### 1. Admin System Security

Key objectives:
- Implement audit logging for all administrative actions
- Create enhanced UI for bulk operations
- Improve credential security beyond environment variables
- Add comprehensive error handling for admin operations

### 2. Server-Side Performance

Key objectives:
- Implement Redis caching layer for frequently accessed data
- Add database indexes for optimized query performance
- Create batch operations for admin tasks
- Optimize WebSocket connections and enhance reliability

### 3. Frontend Advanced Optimizations

Key objectives:
- Implement React.memo for expensive components
- Optimize bundle size with code splitting enhancements
- Add error boundaries for critical components
- Enhance JavaScript execution performance

## ⚡️ Implementation Tasks (Priority Order)

### 1. Admin System Security Enhancement

#### A. Implement Admin Audit Logging

```typescript
// server/middleware/audit-logging.ts
import { db } from '../../db';
import { adminLogs } from '../../db/schema/admin-logs';

export const auditLoggingMiddleware = (req, res, next) => {
  // Store original send and end methods
  const originalEnd = res.end;
  const originalSend = res.send;
  
  // Track response body
  let responseBody = '';
  
  // Override send method to capture response
  res.send = function(body) {
    responseBody = body;
    return originalSend.call(this, body);
  };
  
  // Override end method to log action
  res.end = async function(...args) {
    try {
      const user = req.user;
      const action = req.method + ' ' + req.path;
      const timestamp = new Date().toISOString();
      const status = res.statusCode;
      
      // Create log entry
      await db.insert(adminLogs).values({
        userId: user?.id || 'anonymous',
        action,
        timestamp,
        status,
        requestBody: JSON.stringify(req.body),
        responseBody: responseBody || '',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't block the response if logging fails
    }
    
    return originalEnd.apply(this, args);
  };
  
  next();
};

// Apply to admin routes in server/routes.ts
import { auditLoggingMiddleware } from './middleware/audit-logging';
app.use('/api/admin', auditLoggingMiddleware);
```

#### B. Create Database Schema for Audit Logs

```typescript
// db/schema/admin-logs.ts
import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const adminLogs = pgTable('admin_logs', {
  id: text('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  status: integer('status').notNull(),
  requestBody: text('request_body'),
  responseBody: text('response_body'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

// Run migration to create table
// npx drizzle-kit generate:pg --schema=./db/schema/admin-logs.ts
```

#### C. Implement Admin UI Bulk Actions

```tsx
// client/src/components/admin/BulkActionBar.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface BulkActionBarProps {
  selectedItems: string[];
  actions: { label: string; value: string }[];
  onBulkAction: (action: string, itemIds: string[]) => Promise<any>;
}

export function BulkActionBar({ selectedItems, actions, onBulkAction }: BulkActionBarProps) {
  const [selectedAction, setSelectedAction] = useState('');
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: () => onBulkAction(selectedAction, selectedItems),
    onSuccess: () => {
      // Invalidate queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      // Reset selection
      setSelectedAction('');
    }
  });
  
  const isDisabled = selectedItems.length === 0 || !selectedAction || mutation.isPending;
  
  return (
    <div className="flex items-center gap-2 p-4 bg-[#1A1B21] border border-[#2A2B31] rounded-lg mb-4">
      <div className="text-sm text-white font-medium">
        {selectedItems.length === 0 
          ? 'No items selected' 
          : `${selectedItems.length} item(s) selected`}
      </div>
      
      <div className="flex-1">
        <Select value={selectedAction} onValueChange={setSelectedAction}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an action..." />
          </SelectTrigger>
          <SelectContent>
            {actions.map((action) => (
              <SelectItem key={action.value} value={action.value}>
                {action.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="default" 
        disabled={isDisabled}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? 'Processing...' : 'Apply'}
      </Button>
    </div>
  );
}
```

#### D. Implement Secure Credential Storage

```typescript
// server/services/credentialService.ts
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../../db';
import { adminCredentials } from '../../db/schema/admin-credentials';
import { eq } from 'drizzle-orm';

// Generate a secure key
export function generateSecureKey(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hash a password or API key
export async function hashCredential(credential: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(credential, salt);
}

// Verify a credential
export async function verifyCredential(
  plaintext: string, 
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hashed);
}

// Store admin credentials securely
export async function storeAdminCredential(
  adminId: string,
  username: string,
  password: string
): Promise<void> {
  const hashedPassword = await hashCredential(password);
  
  // Generate API key for programmatic access
  const apiKey = generateSecureKey();
  const hashedApiKey = await hashCredential(apiKey);
  
  // Store in database (upsert to handle updates)
  await db
    .insert(adminCredentials)
    .values({
      adminId,
      username,
      password: hashedPassword,
      apiKey: hashedApiKey,
      createdAt: new Date()
    })
    .onConflictDoUpdate({
      target: adminCredentials.adminId,
      set: {
        username,
        password: hashedPassword,
        apiKey: hashedApiKey,
        updatedAt: new Date()
      }
    });
    
  // In a real system, securely deliver the API key to the admin
  console.log(`API Key for ${username}: ${apiKey}`);
}

// Validate admin credentials
export async function validateAdminCredentials(
  username: string,
  password: string
): Promise<string | null> {
  const result = await db.query.adminCredentials.findFirst({
    where: eq(adminCredentials.username, username)
  });
  
  if (!result) return null;
  
  const valid = await verifyCredential(password, result.password);
  return valid ? result.adminId : null;
}
```

### 2. Server-Side Performance Optimization

#### A. Implement Redis Caching

```typescript
// server/services/cacheService.ts
import Redis from 'ioredis';
import { createClient } from 'redis';

// Create Redis connection
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : createClient({ url: 'redis://localhost:6379' }).connect();

// Cache middleware
export const cacheMiddleware = (keyPrefix: string, ttl = 60) => {
  return async (req, res, next) => {
    try {
      // Generate cache key from request
      const key = `${keyPrefix}:${req.originalUrl}`;
      
      // Try to get from cache
      const cachedData = await redis.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original send method
      const originalSend = res.send;
      
      // Override send method to cache response before sending
      res.send = function(body) {
        try {
          // Only cache successful responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Don't await to not block response
            redis.set(key, body, 'EX', ttl);
          }
        } catch (err) {
          console.error('Cache error:', err);
        }
        return originalSend.call(this, body);
      };
      
      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next();
    }
  };
};

// Cache service methods
export const cacheService = {
  // Set cache with TTL
  async set(key: string, data: any, ttl = 60): Promise<void> {
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
  },
  
  // Get from cache
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  
  // Delete from cache
  async del(key: string): Promise<void> {
    await redis.del(key);
  },
  
  // Clear cache by pattern
  async clearPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
  
  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
};

// Apply caching to routes
// In server/routes/users.ts
import { cacheMiddleware } from '../services/cacheService';

// Cache user lists for 5 minutes
router.get('/users', cacheMiddleware('users', 300), async (req, res) => {
  // User list fetch logic
});

// Cache individual user for 10 minutes
router.get('/users/:id', cacheMiddleware('user', 600), async (req, res) => {
  // User fetch logic
});
```

#### B. Implement Cache Invalidation

```typescript
// server/services/userService.ts
import { cacheService } from './cacheService';

export async function updateUser(userId: string, userData: any) {
  try {
    // Update user in database
    const updatedUser = await db.update(users)
      .set(userData)
      .where(eq(users.id, userId))
      .returning();
    
    // Invalidate user cache
    await cacheService.del(`user:${req.originalUrl}`);
    
    // Invalidate any lists containing this user
    await cacheService.clearPattern('users:*');
    
    return updatedUser[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}
```

#### C. Add Database Indexes

```typescript
// db/schema/users.ts
import { pgTable, text, serial, integer, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  goatedId: text('goated_id').notNull().default(''),
  telegramId: text('telegram_id'),
  username: text('username').notNull(),
  email: text('email').notNull(),
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  emailVerified: boolean('email_verified').notNull().default(false),
  metadata: jsonb('metadata')
}, (table) => {
  return {
    goatedIdIdx: index('goated_id_idx').on(table.goatedId),
    telegramIdIdx: index('telegram_id_idx').on(table.telegramId),
    usernameIdx: index('username_idx').on(table.username),
    emailIdx: index('email_idx').on(table.email),
    createdAtIdx: index('created_at_idx').on(table.createdAt)
  }
});

// db/schema/user-stats.ts
export const userStats = pgTable('user_stats', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  date: timestamp('date').notNull(),
  wagered: decimal('wagered', { precision: 16, scale: 8 }).notNull().default('0'),
  profit: decimal('profit', { precision: 16, scale: 8 }).notNull().default('0'),
  bets: integer('bets').notNull().default(0)
}, (table) => {
  return {
    userDateIdx: index('user_date_idx').on(table.userId, table.date),
    dateIdx: index('date_idx').on(table.date)
  }
});

// Generate and run migrations
// npx drizzle-kit generate:pg
// npx drizzle-kit push:pg
```

#### D. Implement Batch Operations

```typescript
// server/services/batchService.ts
import { db } from '../../db';
import { users } from '../../db/schema/users';
import { eq, inArray } from 'drizzle-orm';

export async function batchUpdateUsers(
  userIds: string[], 
  updateData: Partial<typeof users.$inferInsert>
): Promise<number> {
  // Start a transaction for data consistency
  return db.transaction(async (tx) => {
    const result = await tx.update(users)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(inArray(users.id, userIds));
    
    return result.rowCount || 0;
  });
}

export async function batchDeleteUsers(userIds: string[]): Promise<number> {
  return db.transaction(async (tx) => {
    // Delete related records first (cascade manually if needed)
    await tx.delete(userStats).where(inArray(userStats.userId, userIds));
    
    // Delete users
    const result = await tx.delete(users)
      .where(inArray(users.id, userIds));
    
    return result.rowCount || 0;
  });
}

// Example API endpoint
router.post('/api/admin/users/batch', async (req, res) => {
  try {
    const { userIds, action, data } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty userIds array' });
    }
    
    let result;
    
    switch (action) {
      case 'update':
        result = await batchUpdateUsers(userIds, data);
        break;
      case 'delete':
        result = await batchDeleteUsers(userIds);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    return res.json({ success: true, affected: result });
  } catch (error) {
    console.error('Batch operation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 3. WebSocket Connection Optimization

#### A. Implement WebSocket Heartbeat

```typescript
// server/websocket/heartbeat.ts
import { WebSocket } from 'ws';

export function setupHeartbeat(wss: WebSocket.Server) {
  // Set up heartbeat on server to detect dead clients
  wss.on('connection', (ws) => {
    // Mark client as alive initially
    ws.isAlive = true;
    
    // Handle pong responses from client
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    // Send heartbeat to client
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    });
  });
  
  // Check for dead clients every 30 seconds
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        // Client didn't respond to ping, terminate connection
        return ws.terminate();
      }
      
      // Mark as not alive until pong is received
      ws.isAlive = false;
      // Send ping
      ws.ping();
    });
  }, 30000);
  
  // Clear interval when server closes
  wss.on('close', () => {
    clearInterval(interval);
  });
}

// Client-side heartbeat implementation
// client/src/services/websocketService.ts
export class WebSocketService {
  private ws: WebSocket | null = null;
  private heartbeatInterval: number | null = null;
  private reconnectTimeout: number | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  
  constructor(url: string) {
    this.url = url;
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.startHeartbeat();
      this.clearReconnectTimeout();
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.stopHeartbeat();
      this.scheduleReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Automatically try to reconnect on error
      this.ws?.close();
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'pong') {
        // Heartbeat response received
        return;
      }
      
      // Handle other messages
      this.handleMessage(message);
    };
  }
  
  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Send heartbeat ping
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 15000); // 15 seconds
  }
  
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  private scheduleReconnect() {
    // Use exponential backoff for reconnection
    const backoff = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts));
    
    this.reconnectTimeout = window.setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect();
    }, backoff);
    
    this.reconnectAttempts++;
  }
  
  private clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = 0;
  }
  
  // Handle incoming messages
  private handleMessage(message: any) {
    // Process message based on type
    console.log('Received message:', message);
  }
  
  // Public methods for sending messages
  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected, cannot send message');
    }
  }
  
  // Cleanup
  disconnect() {
    this.stopHeartbeat();
    this.clearReconnectTimeout();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

#### B. Implement WebSocket Connection Pooling

```typescript
// server/websocket/connection-pool.ts
import { WebSocket } from 'ws';

interface PooledConnection {
  ws: WebSocket;
  userId: string;
  sessionId: string;
  lastActivity: Date;
}

export class WebSocketConnectionPool {
  private connections: Map<string, PooledConnection> = new Map();
  
  // Add connection to pool
  addConnection(sessionId: string, userId: string, ws: WebSocket) {
    this.connections.set(sessionId, {
      ws,
      userId,
      sessionId,
      lastActivity: new Date()
    });
    
    // Set up cleanup when connection closes
    ws.on('close', () => {
      this.removeConnection(sessionId);
    });
  }
  
  // Remove connection from pool
  removeConnection(sessionId: string) {
    this.connections.delete(sessionId);
  }
  
  // Update last activity time
  updateActivity(sessionId: string) {
    const connection = this.connections.get(sessionId);
    if (connection) {
      connection.lastActivity = new Date();
    }
  }
  
  // Send message to specific user (across all their sessions)
  sendToUser(userId: string, message: any) {
    const messageString = JSON.stringify(message);
    let sent = 0;
    
    for (const connection of this.connections.values()) {
      if (connection.userId === userId && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(messageString);
        sent++;
      }
    }
    
    return sent;
  }
  
  // Send message to specific session
  sendToSession(sessionId: string, message: any) {
    const connection = this.connections.get(sessionId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }
  
  // Broadcast to all connections
  broadcast(message: any) {
    const messageString = JSON.stringify(message);
    let sent = 0;
    
    for (const connection of this.connections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(messageString);
        sent++;
      }
    }
    
    return sent;
  }
  
  // Get number of active connections
  get connectionCount() {
    return this.connections.size;
  }
  
  // Get number of unique users
  get userCount() {
    const uniqueUsers = new Set<string>();
    for (const connection of this.connections.values()) {
      uniqueUsers.add(connection.userId);
    }
    return uniqueUsers.size;
  }
  
  // Periodic cleanup of inactive connections
  startCleanup(inactivityTimeout = 3600000) { // 1 hour default
    setInterval(() => {
      const now = new Date().getTime();
      for (const [sessionId, connection] of this.connections.entries()) {
        const lastActivity = connection.lastActivity.getTime();
        if (now - lastActivity > inactivityTimeout) {
          // Close inactive connection
          connection.ws.close();
          this.removeConnection(sessionId);
        }
      }
    }, 300000); // Run cleanup every 5 minutes
  }
}

// Usage in WebSocket server
const connectionPool = new WebSocketConnectionPool();
connectionPool.startCleanup();

wss.on('connection', (ws, req) => {
  // Extract user info from request (e.g., from JWT in query param)
  const userId = /* authenticate and get user ID */;
  const sessionId = crypto.randomUUID();
  
  connectionPool.addConnection(sessionId, userId, ws);
  
  ws.on('message', (data) => {
    // Update activity timestamp
    connectionPool.updateActivity(sessionId);
    
    // Process message
    // ...
  });
});
```

### 4. Frontend Advanced Optimizations

#### A. Implement Memoization for Expensive Components

```tsx
// client/src/components/LeaderboardTable.tsx
import React, { useMemo } from 'react';

// Define props with proper types
interface LeaderboardTableProps {
  users: User[];
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  sortBy: 'wagered' | 'profit' | 'bets';
  page: number;
  pageSize: number;
}

// Use React.memo to prevent unnecessary re-renders
export const LeaderboardTable = React.memo(function LeaderboardTable({
  users,
  period,
  sortBy,
  page,
  pageSize
}: LeaderboardTableProps) {
  // Memoize expensive calculations
  const sortedUsers = useMemo(() => {
    // Deep copy to avoid modifying original data
    const usersCopy = [...users];
    return usersCopy.sort((a, b) => b[sortBy] - a[sortBy]);
  }, [users, sortBy]);
  
  // Memoize pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedUsers.slice(startIndex, startIndex + pageSize);
  }, [sortedUsers, page, pageSize]);
  
  // Memoize stats calculation
  const stats = useMemo(() => {
    return {
      totalWagered: users.reduce((sum, user) => sum + user.wagered, 0),
      totalUsers: users.length,
      topWagered: users.length > 0 ? Math.max(...users.map(u => u.wagered)) : 0
    };
  }, [users]);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Wagered" value={formatCurrency(stats.totalWagered)} />
        <StatCard label="Active Users" value={stats.totalUsers.toString()} />
        <StatCard label="Top Wager" value={formatCurrency(stats.topWagered)} />
      </div>
      
      <table className="w-full">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Wagered</th>
            <th>Profit</th>
            <th>Bets</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user, index) => (
            <LeaderboardRow
              key={user.id}
              user={user}
              rank={(page - 1) * pageSize + index + 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

// Memoize individual rows as well
const LeaderboardRow = React.memo(function LeaderboardRow({
  user,
  rank
}: {
  user: User;
  rank: number;
}) {
  return (
    <tr>
      <td>{rank}</td>
      <td>{user.username}</td>
      <td>{formatCurrency(user.wagered)}</td>
      <td className={user.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
        {formatCurrency(user.profit)}
      </td>
      <td>{user.bets.toLocaleString()}</td>
    </tr>
  );
});

// Simple stat card component
const StatCard = React.memo(function StatCard({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#1A1B21] p-4 rounded-lg">
      <h3 className="text-sm text-gray-400">{label}</h3>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
});
```

#### B. Implement Error Boundaries

```tsx
// client/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report to error tracking service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <div className="p-6 bg-[#1A1B21] border border-red-500 rounded-lg">
          <h2 className="text-lg font-bold text-re
