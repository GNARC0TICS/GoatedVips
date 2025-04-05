# GoatedVIPs Platform - Phase 2 Implementation Guide

## 📋 Overview

This guide outlines the first set of critical enhancements for the GoatedVIPs platform implementation on Replit. Phase 2 focuses on core performance optimizations, authentication security, and verification system implementation.

## 🚀 Getting Started

### First Steps
1. Review the Memory Bank files in order:
   - `projectbrief.md` → `productContext.md` → `systemPatterns.md` → `techContext.md` → `activeContext.md` → `progress.md`
2. Read the documentation files:
   - `docs/loading-performance-optimization.md` - Performance optimization details
   - `docs/layout-optimization.md` - UI enhancement patterns

### Environment Setup
```bash
# Required environment variables for Phase 2
JWT_SECRET=your-jwt-secret
ADMIN_USERNAME=admin-username
ADMIN_PASSWORD=admin-password
DATABASE_URL=your-database-url
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

## ✅ Current State (Post-Phase 1)

Phase 1 established a solid foundation with:
- Centralized service layer for both client and server
- Enhanced authentication hooks and middleware
- Proper TypeScript typing throughout the codebase
- Standardized UI patterns with style constants and animation presets

## 🔍 Phase 2 Focus Areas

### 1. Performance Optimization

Performance issues identified:
- React Query inefficiencies (missing configuration, inconsistent query keys)
- Unoptimized image loading causing layout shifts
- Missing skeleton loaders for asynchronous content
- No code splitting for route-based components

### 2. Authentication Security

Security gaps identified:
- Missing token refresh mechanism
- No rate limiting for authentication endpoints
- Lack of account lockout for failed login attempts
- Inadequate session management

### 3. Email Verification System

Required implementation:
- Email verification token generation
- Email sending functionality
- Client-side verification UI flow
- Database schema updates for verification status

## ⚡️ Implementation Tasks (Priority Order)

### 1. Performance Optimization

#### A. Implement Centralized Query Client

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

// In client/src/main.tsx, update to use this configuration:
import { queryClient } from './lib/queryClient';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

#### B. Update Query Hooks with Standardized Keys

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
```

#### C. Implement Skeleton Loaders for Primary Components

```tsx
// client/src/components/ProfileSkeleton.tsx
export const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-24 bg-[#242530] rounded-xl mb-4"></div>
    <div className="h-12 w-1/3 bg-[#242530] rounded-lg mb-2"></div>
    <div className="h-4 bg-[#242530] rounded-md mb-1"></div>
    <div className="h-4 bg-[#242530] rounded-md"></div>
  </div>
);

// Usage in components:
{isLoading ? (
  <ProfileSkeleton />
) : (
  <ProfileContent user={user} />
)}
```

#### D. Optimize Image Loading

Update images across the application to include proper dimensions and loading attributes:

```tsx
// Before:
<img src="/images/profile.jpg" alt="Profile" className="w-full h-auto" />

// After:
<img 
  src="/images/profile.jpg" 
  alt="Profile" 
  width="400" 
  height="300"
  loading="lazy" // For below-the-fold images
  className="w-full h-auto" 
/>
```

#### E. Implement Code Splitting for Routes

```tsx
// client/src/App.tsx
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingSpinner } from './components/LoadingSpinner';

// Use lazy loading for route components
const Home = React.lazy(() => import('./pages/Home'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Authentication Enhancement

#### A. Implement Token Refresh System

```typescript
// client/src/services/authService.ts
export async function refreshToken(): Promise<boolean> {
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
}

// Auto-refresh setup in client/src/hooks/use-auth.tsx
const setupTokenRefresh = (tokenExpiration: number) => {
  // Refresh 1 minute before expiration
  const refreshTime = (tokenExpiration - 60) * 1000;
  const now = Date.now();
  const timeUntilRefresh = refreshTime - now;
  
  if (timeUntilRefresh <= 0) {
    refreshToken();
    return;
  }
  
  const timeoutId = setTimeout(() => refreshToken(), timeUntilRefresh);
  return () => clearTimeout(timeoutId);
};

// Use in Auth Provider
useEffect(() => {
  if (isAuthenticated && tokenExpiration) {
    return setupTokenRefresh(tokenExpiration);
  }
}, [isAuthenticated, tokenExpiration]);
```

#### B. Implement Token Refresh Endpoint

```typescript
// server/routes/auth.ts
router.post("/refresh-token", async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token missing' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId)
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // Set new access token as cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

#### C. Add Rate Limiting for Auth Endpoints

```typescript
// server/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  message: { error: 'Too many login attempts, please try again later' }
});

// In server/routes/auth.ts
import { authLimiter } from '../middleware/rate-limit';

router.post('/login', authLimiter, async (req, res) => {
  // Login logic
});

router.post('/register', authLimiter, async (req, res) => {
  // Registration logic
});
```

#### D. Implement Account Lockout for Failed Logins

```typescript
// server/services/authService.ts
// Simple in-memory store for failed login attempts 
// (In production, use Redis or database)
const loginAttempts = new Map();

export async function authenticateUser(username: string, password: string) {
  const userKey = `login:${username}`;
  
  // Check if account is locked
  if (loginAttempts.get(userKey)?.attempts >= 5) {
    const lockTime = loginAttempts.get(userKey).lockUntil;
    if (Date.now() < lockTime) {
      throw new Error('Account temporarily locked due to too many failed attempts');
    }
    // Reset after lockout period
    loginAttempts.delete(userKey);
  }
  
  try {
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user) {
      recordFailedAttempt(userKey);
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      recordFailedAttempt(userKey);
      throw new Error('Invalid credentials');
    }
    
    // Reset login attempts on successful login
    loginAttempts.delete(userKey);
    
    return user;
  } catch (error) {
    throw error;
  }
}

function recordFailedAttempt(userKey: string) {
  const attempts = (loginAttempts.get(userKey)?.attempts || 0) + 1;
  const lockUntil = attempts >= 5 ? Date.now() + (30 * 60 * 1000) : 0; // 30-minute lockout
  
  loginAttempts.set(userKey, { attempts, lockUntil });
}
```

### 3. Email Verification System

#### A. Create Verification Token Generator

```typescript
// server/services/verificationService.ts
import jwt from 'jsonwebtoken';
import { users } from '../../db/schema/users';
import { db } from '../../db';
import { eq } from 'drizzle-orm';

// Generate verification token
export function generateVerificationToken(userId: string): string {
  const payload = { userId, type: 'email_verification' };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// Verify token
export async function verifyEmailToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    if (!decoded || decoded.type !== 'email_verification') {
      return null;
    }
    
    // Update user verification status
    await db.update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, decoded.userId));
    
    return decoded.userId;
  } catch (error) {
    console.error('Verification error:', error);
    return null;
  }
}
```

#### B. Implement Email Sending Functionality

```typescript
// server/services/emailService.ts
import nodemailer from 'nodemailer';

// Create transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send verification email
export async function sendVerificationEmail(
  to: string, 
  username: string, 
  verificationToken: string
): Promise<boolean> {
  const verificationUrl = `${process.env.APP_URL}/verify?token=${verificationToken}`;
  
  // Get email template
  const template = require('../templates/verification-email').getTemplate({
    username,
    verificationUrl
  });
  
  try {
    await transporter.sendMail({
      from: `"GoatedVIPs" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Verify your GoatedVIPs account',
      html: template
    });
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}
```

#### C. Create Verification Routes

```typescript
// server/routes/verification.ts
import express from 'express';
import { generateVerificationToken, verifyEmailToken } from '../services/verificationService';
import { sendVerificationEmail } from '../services/emailService';
import { users } from '../../db/schema/users';
import { db } from '../../db';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Send verification email
router.post('/send-verification', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate token
    const token = generateVerificationToken(user.id);
    
    // Send email
    const success = await sendVerificationEmail(
      user.email,
      user.username,
      token
    );
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Send verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify email endpoint
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.redirect('/verification-failed');
    }
    
    const userId = await verifyEmailToken(token);
    
    if (!userId) {
      return res.redirect('/verification-failed');
    }
    
    return res.redirect('/verification-success');
  } catch (error) {
    console.error('Verification error:', error);
    return res.redirect('/verification-failed');
  }
});

export default router;
```

#### D. Create Client-Side Verification UI

```tsx
// client/src/pages/VerificationSuccess.tsx
function VerificationSuccess() {
  return (
    <div className="container mx-auto max-w-2xl py-16 px-4">
      <div className="bg-[#1A1B21] border border-[#2A2B31] rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Verification Successful!</h1>
        <p className="text-gray-300 mb-6">
          Your email has been successfully verified. You can now access all features of GoatedVIPs.
        </p>
        <Link 
          to="/dashboard" 
          className="bg-[#D7FF00] text-black px-6 py-3 rounded-lg font-bold inline-block"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
```

## 📝 Memory Bank Updates

As you complete each task, update the Memory Bank files accordingly:

1. **activeContext.md**
   - Document current focus and recent changes
   - Update challenges and next steps

2. **progress.md**
   - Check off completed Phase 2 tasks
   - Document any issues encountered

## 📊 Verification Checklist

Before completing Phase 2, verify these items:

1. **Performance Metrics**
   - QueryClient properly configured with optimal defaults
   - Images have proper dimensions and loading attributes
   - Lazy-loaded routes working correctly
   - Skeleton loaders appear during loading states

2. **Authentication Security**
   - Token refresh mechanism works correctly
   - Rate limiting prevents excessive login attempts
   - Account lockout functions after multiple failed attempts

3. **Email Verification**
   - Verification emails are correctly sent
   - Tokens are properly validated
   - User verification status updates in database
   - UI flow guides users through the verification process

## ⬇️ Next Steps

After completing Phase 2, proceed to Phase 3 to implement:

1. Admin system security enhancements
2. Server-side caching with Redis
3. Database optimization with indexes
4. WebSocket connection improvements
5. Frontend optimizations for expensive components

Refer to `docs/phase3-implementation-guide.md` for detailed instructions on Phase 3 implementation.
