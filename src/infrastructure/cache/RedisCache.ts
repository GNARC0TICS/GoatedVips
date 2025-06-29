import Redis from 'ioredis';
import { ICacheService } from './ICacheService';

export class RedisCache implements ICacheService {
  private redis: Redis;
  private readonly keyPrefix: string;

  constructor(host: string = 'localhost', port: number = 6379, password?: string, options: {
    db?: number;
    keyPrefix?: string;
    maxRetriesPerRequest?: number;
    retryDelayOnFailover?: number;
    lazyConnect?: boolean;
  } = {}) {
    this.keyPrefix = options.keyPrefix || 'gvip:';
    
    this.redis = new Redis({
      host: host || process.env.REDIS_HOST || 'localhost',
      port: port || parseInt(process.env.REDIS_PORT || '6379'),
      password: password || process.env.REDIS_PASSWORD,
      db: options.db || parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: options.maxRetriesPerRequest || 3,
      retryDelayOnFailover: options.retryDelayOnFailover || 100,
      lazyConnect: options.lazyConnect !== false,
      
      // Connection pool settings
      maxConnections: 20,
      minConnections: 5,
      
      // Retry settings
      retryStrategyOnFailover: () => 100,
      enableReadyCheck: true,
      maxLoadingTimeout: 2000,
      
      // Serialization
      keyPrefix: this.keyPrefix,
    });

    // Handle connection events
    this.redis.on('connect', () => {
      console.log('Redis connected');
    });

    this.redis.on('error', (error) => {
      console.error('Redis error:', error);
    });

    this.redis.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Redis DELETE error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result > 0;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async mget(keys: string[]): Promise<(any | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Redis MGET error:', error);
      return keys.map(() => null);
    }
  }

  async mset(keyValues: Record<string, any>, ttlSeconds?: number): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of Object.entries(keyValues)) {
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
          pipeline.setex(key, ttlSeconds, serialized);
        } else {
          pipeline.set(key, serialized);
        }
      }
      
      await pipeline.exec();
    } catch (error) {
      console.error('Redis MSET error:', error);
      throw error;
    }
  }

  async mdelete(keys: string[]): Promise<number> {
    try {
      return await this.redis.del(...keys);
    } catch (error) {
      console.error('Redis MDELETE error:', error);
      return 0;
    }
  }

  // List operations
  async lpush(key: string, ...values: any[]): Promise<number> {
    try {
      const serialized = values.map(v => JSON.stringify(v));
      return await this.redis.lpush(key, ...serialized);
    } catch (error) {
      console.error(`Redis LPUSH error for key ${key}:`, error);
      throw error;
    }
  }

  async rpush(key: string, ...values: any[]): Promise<number> {
    try {
      const serialized = values.map(v => JSON.stringify(v));
      return await this.redis.rpush(key, ...serialized);
    } catch (error) {
      console.error(`Redis RPUSH error for key ${key}:`, error);
      throw error;
    }
  }

  async lpop(key: string): Promise<any | null> {
    try {
      const value = await this.redis.lpop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Redis LPOP error for key ${key}:`, error);
      return null;
    }
  }

  async rpop(key: string): Promise<any | null> {
    try {
      const value = await this.redis.rpop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Redis RPOP error for key ${key}:`, error);
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    try {
      const values = await this.redis.lrange(key, start, stop);
      return values.map(v => JSON.parse(v));
    } catch (error) {
      console.error(`Redis LRANGE error for key ${key}:`, error);
      return [];
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.redis.llen(key);
    } catch (error) {
      console.error(`Redis LLEN error for key ${key}:`, error);
      return 0;
    }
  }

  // TTL operations
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }

  // Pattern operations
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error(`Redis KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  }

  // Atomic operations
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch (error) {
      console.error(`Redis INCR error for key ${key}:`, error);
      throw error;
    }
  }

  // Utility
  async flushall(): Promise<void> {
    try {
      await this.redis.flushall();
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
      throw error;
    }
  }

  async ping(): Promise<string> {
    try {
      return await this.redis.ping();
    } catch (error) {
      console.error('Redis PING error:', error);
      throw error;
    }
  }

  // Connection management
  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }

  async quit(): Promise<void> {
    await this.redis.quit();
  }

  // Get Redis instance for advanced operations
  getRedisInstance(): Redis {
    return this.redis;
  }
}