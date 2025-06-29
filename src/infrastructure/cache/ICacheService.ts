export interface ICacheService {
  // Basic operations
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  
  // Advanced operations
  mget(keys: string[]): Promise<(any | null)[]>;
  mset(keyValues: Record<string, any>, ttlSeconds?: number): Promise<void>;
  mdelete(keys: string[]): Promise<number>;
  
  // List operations
  lpush(key: string, ...values: any[]): Promise<number>;
  rpush(key: string, ...values: any[]): Promise<number>;
  lpop(key: string): Promise<any | null>;
  rpop(key: string): Promise<any | null>;
  lrange(key: string, start: number, stop: number): Promise<any[]>;
  llen(key: string): Promise<number>;
  
  // Set operations
  sadd(key: string, ...members: any[]): Promise<number>;
  srem(key: string, ...members: any[]): Promise<number>;
  smembers(key: string): Promise<any[]>;
  sismember(key: string, member: any): Promise<boolean>;
  scard(key: string): Promise<number>;
  
  // Hash operations
  hget(key: string, field: string): Promise<any | null>;
  hset(key: string, field: string, value: any): Promise<void>;
  hmget(key: string, fields: string[]): Promise<(any | null)[]>;
  hmset(key: string, fieldValues: Record<string, any>): Promise<void>;
  hgetall(key: string): Promise<Record<string, any>>;
  hdel(key: string, ...fields: string[]): Promise<number>;
  
  // TTL operations
  expire(key: string, seconds: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
  persist(key: string): Promise<boolean>;
  
  // Pattern operations
  keys(pattern: string): Promise<string[]>;
  scan(cursor: number, pattern?: string, count?: number): Promise<{ cursor: number; keys: string[] }>;
  
  // Atomic operations
  incr(key: string): Promise<number>;
  incrby(key: string, increment: number): Promise<number>;
  decr(key: string): Promise<number>;
  decrby(key: string, decrement: number): Promise<number>;
  
  // Utility
  flushall(): Promise<void>;
  ping(): Promise<string>;
}