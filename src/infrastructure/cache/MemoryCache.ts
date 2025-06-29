import { ICacheService } from './ICacheService';

interface CacheItem {
  value: any;
  expiresAt?: number;
}

export class MemoryCache implements ICacheService {
  private cache = new Map<string, CacheItem>();
  private readonly keyPrefix: string;
  private cleanupInterval: NodeJS.Timeout;

  constructor(options: { keyPrefix?: string } = {}) {
    this.keyPrefix = options.keyPrefix || 'gvip:';
    
    // Clean up expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);

    console.log('Memory cache initialized');
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && item.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  private getKey(key: string): string {
    return this.keyPrefix + key;
  }

  async get<T = any>(key: string): Promise<T | null> {
    const fullKey = this.getKey(key);
    const item = this.cache.get(fullKey);
    
    if (!item) return null;
    
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(fullKey);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const fullKey = this.getKey(key);
    const item: CacheItem = { value };
    
    if (ttlSeconds) {
      item.expiresAt = Date.now() + (ttlSeconds * 1000);
    }
    
    this.cache.set(fullKey, item);
  }

  async delete(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    return this.cache.delete(fullKey);
  }

  async exists(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    const item = this.cache.get(fullKey);
    
    if (!item) return false;
    
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(fullKey);
      return false;
    }
    
    return true;
  }

  async mget(keys: string[]): Promise<(any | null)[]> {
    return Promise.all(keys.map(key => this.get(key)));
  }

  async mset(keyValues: Record<string, any>, ttlSeconds?: number): Promise<void> {
    for (const [key, value] of Object.entries(keyValues)) {
      await this.set(key, value, ttlSeconds);
    }
  }

  async mdelete(keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      if (await this.delete(key)) {
        deleted++;
      }
    }
    return deleted;
  }

  async lpush(key: string, ...values: any[]): Promise<number> {
    const existing = await this.get(key) || [];
    const newArray = [...values, ...existing];
    await this.set(key, newArray);
    return newArray.length;
  }

  async rpush(key: string, ...values: any[]): Promise<number> {
    const existing = await this.get(key) || [];
    const newArray = [...existing, ...values];
    await this.set(key, newArray);
    return newArray.length;
  }

  async lpop(key: string): Promise<any | null> {
    const existing = await this.get(key);
    if (!Array.isArray(existing) || existing.length === 0) return null;
    
    const value = existing.shift();
    await this.set(key, existing);
    return value;
  }

  async rpop(key: string): Promise<any | null> {
    const existing = await this.get(key);
    if (!Array.isArray(existing) || existing.length === 0) return null;
    
    const value = existing.pop();
    await this.set(key, existing);
    return value;
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    const existing = await this.get(key);
    if (!Array.isArray(existing)) return [];
    
    return existing.slice(start, stop + 1);
  }

  async llen(key: string): Promise<number> {
    const existing = await this.get(key);
    return Array.isArray(existing) ? existing.length : 0;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const fullKey = this.getKey(key);
    const item = this.cache.get(fullKey);
    
    if (!item) return false;
    
    item.expiresAt = Date.now() + (seconds * 1000);
    this.cache.set(fullKey, item);
    return true;
  }

  async ttl(key: string): Promise<number> {
    const fullKey = this.getKey(key);
    const item = this.cache.get(fullKey);
    
    if (!item) return -2;
    if (!item.expiresAt) return -1;
    
    const remaining = Math.ceil((item.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key) || 0;
    const newValue = Number(current) + 1;
    await this.set(key, newValue);
    return newValue;
  }

  async flushall(): Promise<void> {
    this.cache.clear();
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async disconnect(): Promise<void> {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }

  async quit(): Promise<void> {
    await this.disconnect();
  }

  // Set operations
  async sadd(key: string, ...members: any[]): Promise<number> {
    const existing = await this.get(key) || new Set();
    const set = existing instanceof Set ? existing : new Set(existing);
    let added = 0;
    
    for (const member of members) {
      if (!set.has(member)) {
        set.add(member);
        added++;
      }
    }
    
    await this.set(key, Array.from(set));
    return added;
  }

  async srem(key: string, ...members: any[]): Promise<number> {
    const existing = await this.get(key);
    if (!existing) return 0;
    
    const set = new Set(Array.isArray(existing) ? existing : [existing]);
    let removed = 0;
    
    for (const member of members) {
      if (set.has(member)) {
        set.delete(member);
        removed++;
      }
    }
    
    await this.set(key, Array.from(set));
    return removed;
  }

  async smembers(key: string): Promise<any[]> {
    const existing = await this.get(key);
    if (!existing) return [];
    return Array.isArray(existing) ? existing : [existing];
  }

  async sismember(key: string, member: any): Promise<boolean> {
    const existing = await this.get(key);
    if (!existing) return false;
    const set = new Set(Array.isArray(existing) ? existing : [existing]);
    return set.has(member);
  }

  async scard(key: string): Promise<number> {
    const existing = await this.get(key);
    if (!existing) return 0;
    return Array.isArray(existing) ? existing.length : 1;
  }

  // Hash operations
  async hget(key: string, field: string): Promise<any | null> {
    const hash = await this.get(key);
    return hash && typeof hash === 'object' ? hash[field] || null : null;
  }

  async hset(key: string, field: string, value: any): Promise<void> {
    const hash = await this.get(key) || {};
    hash[field] = value;
    await this.set(key, hash);
  }

  async hmget(key: string, fields: string[]): Promise<(any | null)[]> {
    const hash = await this.get(key) || {};
    return fields.map(field => hash[field] || null);
  }

  async hmset(key: string, fieldValues: Record<string, any>): Promise<void> {
    const hash = await this.get(key) || {};
    Object.assign(hash, fieldValues);
    await this.set(key, hash);
  }

  async hgetall(key: string): Promise<Record<string, any>> {
    const hash = await this.get(key);
    return hash && typeof hash === 'object' ? hash : {};
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    const hash = await this.get(key);
    if (!hash || typeof hash !== 'object') return 0;
    
    let deleted = 0;
    for (const field of fields) {
      if (field in hash) {
        delete hash[field];
        deleted++;
      }
    }
    
    await this.set(key, hash);
    return deleted;
  }

  async persist(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    const item = this.cache.get(fullKey);
    
    if (!item) return false;
    
    delete item.expiresAt;
    this.cache.set(fullKey, item);
    return true;
  }

  async scan(cursor: number, pattern?: string, count?: number): Promise<{ cursor: number; keys: string[] }> {
    const allKeys = Array.from(this.cache.keys());
    const filteredKeys = pattern 
      ? allKeys.filter(key => new RegExp(pattern.replace(/\*/g, '.*')).test(key))
      : allKeys;
    
    const limit = count || 10;
    const start = cursor;
    const end = start + limit;
    const keys = filteredKeys.slice(start, end);
    const nextCursor = end >= filteredKeys.length ? 0 : end;
    
    return { cursor: nextCursor, keys };
  }

  async incrby(key: string, increment: number): Promise<number> {
    const current = await this.get(key) || 0;
    const newValue = Number(current) + increment;
    await this.set(key, newValue);
    return newValue;
  }

  async decr(key: string): Promise<number> {
    return this.incrby(key, -1);
  }

  async decrby(key: string, decrement: number): Promise<number> {
    return this.incrby(key, -decrement);
  }
}