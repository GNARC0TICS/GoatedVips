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
}