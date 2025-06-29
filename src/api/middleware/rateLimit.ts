import { Request, Response, NextFunction } from 'express';
import { ICacheService } from '../../infrastructure/cache/ICacheService';

// Rate limit configuration
export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  max: number;           // Maximum requests per window
  keyGenerator?: (req: Request) => string;  // Custom key generator
  skip?: (req: Request) => boolean;         // Skip rate limiting for certain requests
  message?: string;      // Custom error message
  standardHeaders?: boolean;                // Include rate limit headers
  legacyHeaders?: boolean;                  // Include legacy X-RateLimit headers
}

// Rate limit store interface
export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ totalRequests: number; remainingTime: number }>;
  reset(key: string): Promise<void>;
}

// Redis-based rate limit store
export class RedisRateLimitStore implements RateLimitStore {
  constructor(private cache: ICacheService) {}

  async increment(key: string, windowMs: number): Promise<{ totalRequests: number; remainingTime: number }> {
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const cacheKey = `ratelimit:${key}:${window}`;
    
    try {
      // Increment counter
      const count = await this.cache.incr(cacheKey);
      
      // Set expiration on first increment
      if (count === 1) {
        await this.cache.expire(cacheKey, Math.ceil(windowMs / 1000));
      }
      
      const remainingTime = windowMs - (now % windowMs);
      
      return {
        totalRequests: count,
        remainingTime
      };
    } catch (error) {
      console.error('Rate limit store error:', error);
      // Fail open - allow request if rate limiting fails
      return {
        totalRequests: 1,
        remainingTime: windowMs
      };
    }
  }

  async reset(key: string): Promise<void> {
    try {
      // Find all keys for this identifier
      const pattern = `ratelimit:${key}:*`;
      const keys = await this.cache.keys(pattern);
      
      if (keys.length > 0) {
        await this.cache.mdelete(keys);
      }
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
  }
}

// Memory-based rate limit store (for development/testing)
export class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async increment(key: string, windowMs: number): Promise<{ totalRequests: number; remainingTime: number }> {
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const storeKey = `${key}:${window}`;
    
    let entry = this.store.get(storeKey);
    
    if (!entry) {
      entry = { count: 0, resetTime: (window + 1) * windowMs };
      this.store.set(storeKey, entry);
    }
    
    entry.count++;
    
    // Clean up old entries
    this.cleanup(now);
    
    return {
      totalRequests: entry.count,
      remainingTime: entry.resetTime - now
    };
  }

  async reset(key: string): Promise<void> {
    for (const [storeKey] of this.store) {
      if (storeKey.startsWith(`${key}:`)) {
        this.store.delete(storeKey);
      }
    }
  }

  private cleanup(now: number): void {
    // Clean up expired entries (run occasionally)
    if (Math.random() < 0.01) { // 1% chance
      for (const [key, entry] of this.store) {
        if (now > entry.resetTime) {
          this.store.delete(key);
        }
      }
    }
  }
}

// Rate limiting middleware factory
export function createRateLimitMiddleware(
  store: RateLimitStore,
  defaultConfig: Partial<RateLimitConfig> = {}
) {
  return function rateLimitMiddleware(config: RateLimitConfig) {
    const finalConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      keyGenerator: (req: Request) => req.ip || 'unknown',
      message: 'Too many requests, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
      ...defaultConfig,
      ...config,
    };

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Skip if configured to skip
        if (finalConfig.skip && finalConfig.skip(req)) {
          return next();
        }

        const key = finalConfig.keyGenerator!(req);
        const result = await store.increment(key, finalConfig.windowMs);
        
        const remaining = Math.max(0, finalConfig.max - result.totalRequests);
        const resetTime = new Date(Date.now() + result.remainingTime);
        
        // Add standard headers
        if (finalConfig.standardHeaders) {
          res.set({
            'RateLimit-Limit': finalConfig.max.toString(),
            'RateLimit-Remaining': remaining.toString(),
            'RateLimit-Reset': resetTime.toISOString(),
          });
        }
        
        // Add legacy headers
        if (finalConfig.legacyHeaders) {
          res.set({
            'X-RateLimit-Limit': finalConfig.max.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(resetTime.getTime() / 1000).toString(),
          });
        }
        
        // Check if limit exceeded
        if (result.totalRequests > finalConfig.max) {
          return res.status(429).json({
            success: false,
            error: finalConfig.message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(result.remainingTime / 1000),
            limit: finalConfig.max,
            remaining: 0,
            reset: resetTime.toISOString(),
          });
        }
        
        next();
      } catch (error) {
        console.error('Rate limit middleware error:', error);
        // Fail open - allow request if rate limiting fails
        next();
      }
    };
  };
}

// Predefined rate limit configurations
export const RateLimitPresets = {
  // Very strict - for sensitive operations
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
  },
  
  // Moderate - for authentication
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
  },
  
  // Standard - for general API use
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  
  // Lenient - for public endpoints
  lenient: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
  },
  
  // Burst - short window, higher limit
  burst: {
    windowMs: 60 * 1000, // 1 minute
    max: 20,
  },
};

// Simple rate limit middleware (uses memory store)
export function rateLimitMiddleware(config: RateLimitConfig) {
  const store = new MemoryRateLimitStore();
  const middleware = createRateLimitMiddleware(store);
  return middleware(config);
}

// User-specific rate limiting
export function userRateLimitMiddleware(
  store: RateLimitStore,
  config: RateLimitConfig
) {
  const middleware = createRateLimitMiddleware(store, {
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || req.ip || 'unknown';
    },
  });
  
  return middleware(config);
}

// IP-based rate limiting with whitelist
export function ipRateLimitMiddleware(
  store: RateLimitStore,
  config: RateLimitConfig & { whitelist?: string[] }
) {
  const middleware = createRateLimitMiddleware(store, {
    keyGenerator: (req: Request) => `ip:${req.ip}`,
    skip: (req: Request) => {
      return config.whitelist?.includes(req.ip || '') || false;
    },
  });
  
  return middleware(config);
}

// Sliding window rate limiter
export class SlidingWindowRateLimiter {
  constructor(
    private cache: ICacheService,
    private windowMs: number,
    private maxRequests: number
  ) {}

  async isAllowed(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const cacheKey = `sliding:${key}`;
    
    try {
      // Get existing timestamps
      const timestamps = await this.cache.lrange(cacheKey, 0, -1) || [];
      
      // Filter out expired timestamps
      const validTimestamps = timestamps
        .map(ts => parseInt(ts))
        .filter(ts => ts > windowStart);
      
      // Check if under limit
      const allowed = validTimestamps.length < this.maxRequests;
      
      if (allowed) {
        // Add current timestamp
        await this.cache.lpush(cacheKey, now.toString());
        await this.cache.expire(cacheKey, Math.ceil(this.windowMs / 1000));
      }
      
      // Calculate reset time (when oldest request expires)
      const oldestTimestamp = Math.min(...validTimestamps, now);
      const resetTime = oldestTimestamp + this.windowMs;
      
      return {
        allowed,
        remaining: Math.max(0, this.maxRequests - validTimestamps.length - (allowed ? 1 : 0)),
        resetTime
      };
    } catch (error) {
      console.error('Sliding window rate limiter error:', error);
      // Fail open
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      };
    }
  }
}