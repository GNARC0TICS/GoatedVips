/**
 * Enhanced Caching Service
 * 
 * Provides a flexible caching layer with advanced features like:
 * - Tiered caching with different TTLs
 * - Namespaced cache segments
 * - Data validation
 * - Background refresh capabilities
 * - Cache statistics for monitoring
 */

type CachedItem<T> = {
  data: T;
  timestamp: number;
  validUntil: number;
};

type CachingOptions = {
  ttl?: number;
  namespace?: string;
  staleWhileRevalidate?: boolean;
  errorTtl?: number;
  forceRefresh?: boolean;
};

type CacheStats = {
  hits: number;
  misses: number;
  staleHits: number;
  keys: number;
};

export class CacheService {
  private cache: Map<string, CachedItem<any>>;
  private stats: CacheStats;
  private refreshingKeys: Set<string>;
  
  // Default TTL values in milliseconds
  private readonly DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes
  private readonly DEFAULT_ERROR_TTL = 30 * 1000; // 30 seconds
  
  constructor() {
    this.cache = new Map();
    this.refreshingKeys = new Set();
    this.stats = {
      hits: 0,
      misses: 0,
      staleHits: 0,
      keys: 0
    };
  }
  
  /**
   * Generate a cache key from request data
   */
  generateKey(namespace: string, ...parts: any[]): string {
    const keyParts = [namespace];
    
    for (const part of parts) {
      if (typeof part === 'object') {
        // Sort object keys for consistent key generation
        keyParts.push(JSON.stringify(part, Object.keys(part).sort()));
      } else {
        keyParts.push(String(part));
      }
    }
    
    return keyParts.join(':');
  }
  
  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, options: CachingOptions = {}): void {
    const { 
      ttl = this.DEFAULT_TTL,
      namespace = 'default'
    } = options;
    
    const now = Date.now();
    const fullKey = this.generateKey(namespace, key);
    
    this.cache.set(fullKey, {
      data,
      timestamp: now,
      validUntil: now + ttl
    });
    
    this.stats.keys = this.cache.size;
  }
  
  /**
   * Cache network errors with a shorter TTL to allow for recovery
   */
  setError(key: string, error: Error, options: CachingOptions = {}): void {
    const { 
      errorTtl = this.DEFAULT_ERROR_TTL,
      namespace = 'default'
    } = options;
    
    const fullKey = this.generateKey(namespace, key);
    const now = Date.now();
    
    this.cache.set(fullKey, {
      data: { 
        error: true, 
        message: error.message,
        name: error.name
      },
      timestamp: now,
      validUntil: now + errorTtl
    });
  }
  
  /**
   * Get a value from the cache with TTL validation
   */
  get<T>(key: string, options: CachingOptions = {}): { 
    data: T | null; 
    found: boolean;
    stale: boolean;
  } {
    const { 
      namespace = 'default',
      staleWhileRevalidate = false,
      forceRefresh = false
    } = options;
    
    const fullKey = this.generateKey(namespace, key);
    const cachedItem = this.cache.get(fullKey) as CachedItem<T> | undefined;
    const now = Date.now();
    
    // If forcing refresh, treat as if not in cache
    if (forceRefresh) {
      this.stats.misses++;
      return { data: null, found: false, stale: false };
    }
    
    // Not in cache
    if (!cachedItem) {
      this.stats.misses++;
      return { data: null, found: false, stale: false };
    }
    
    const isExpired = now > cachedItem.validUntil;
    
    // Valid cache hit
    if (!isExpired) {
      this.stats.hits++;
      return { data: cachedItem.data, found: true, stale: false };
    }
    
    // Expired, but we can use stale data while revalidating
    if (staleWhileRevalidate) {
      this.stats.staleHits++;
      return { data: cachedItem.data, found: true, stale: true };
    }
    
    // Expired and we can't use stale data
    this.stats.misses++;
    return { data: null, found: false, stale: false };
  }
  
  /**
   * Remove a specific key from the cache
   */
  invalidate(key: string, namespace = 'default'): void {
    const fullKey = this.generateKey(namespace, key);
    this.cache.delete(fullKey);
    this.stats.keys = this.cache.size;
  }
  
  /**
   * Invalidate all keys in a specific namespace
   */
  invalidateNamespace(namespace: string): void {
    const keysToDelete: string[] = [];
    
    // Find all keys in the namespace using Array.from for compatibility
    Array.from(this.cache.keys()).forEach(key => {
      if (key.startsWith(`${namespace}:`)) {
        keysToDelete.push(key);
      }
    });
    
    // Delete the keys
    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
    
    this.stats.keys = this.cache.size;
  }
  
  /**
   * Clear all cached items
   */
  clear(): void {
    this.cache.clear();
    this.stats.keys = 0;
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }
  
  /**
   * Check if a cache key is currently being refreshed
   */
  isRefreshing(key: string, namespace = 'default'): boolean {
    const fullKey = this.generateKey(namespace, key);
    return this.refreshingKeys.has(fullKey);
  }
  
  /**
   * Mark a key as currently being refreshed
   */
  markRefreshing(key: string, namespace = 'default'): void {
    const fullKey = this.generateKey(namespace, key);
    this.refreshingKeys.add(fullKey);
  }
  
  /**
   * Mark a key as no longer being refreshed
   */
  markRefreshComplete(key: string, namespace = 'default'): void {
    const fullKey = this.generateKey(namespace, key);
    this.refreshingKeys.delete(fullKey);
  }
  
  /**
   * Get a list of all cache keys
   */
  getKeys(): string[] {
    // Using Array.from for compatibility
    return Array.from(this.cache.keys());
  }
}

// Export a singleton instance for application-wide use
export const cacheService = new CacheService();

// Helper function to wrap data fetching with caching
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CachingOptions = {}
): Promise<T> {
  const { 
    namespace = 'default',
    ttl = 2 * 60 * 1000, // 2 minutes
    staleWhileRevalidate = true,
    errorTtl = 30 * 1000,
    forceRefresh = false
  } = options;
  
  // Check if key is being refreshed by another request
  if (cacheService.isRefreshing(key, namespace) && !forceRefresh) {
    // Another request is already refreshing this key, use cached data if available
    const { data, found } = cacheService.get<T>(key, { namespace, staleWhileRevalidate: true });
    if (found) {
      return data as T;
    }
    // No cached data, need to wait for refresh
  }
  
  // Check cache first
  const { data, found, stale } = cacheService.get<T>(key, { 
    namespace, 
    staleWhileRevalidate,
    forceRefresh 
  });
  
  // If we have valid data and not forcing refresh, return it
  if (found && !stale && !forceRefresh) {
    return data as T;
  }
  
  // If we're going to fetch fresh data, mark this key as refreshing
  cacheService.markRefreshing(key, namespace);
  
  try {
    // Fetch fresh data
    const fresh = await fetcher();
    
    // Store in cache with the provided TTL
    cacheService.set(key, fresh, { namespace, ttl });
    
    // Mark refresh as complete
    cacheService.markRefreshComplete(key, namespace);
    
    return fresh;
  } catch (error) {
    // Cache the error with a shorter TTL
    if (error instanceof Error) {
      cacheService.setError(key, error, { namespace, errorTtl });
    }
    
    // Mark refresh as complete
    cacheService.markRefreshComplete(key, namespace);
    
    // If we have stale data and are allowing stale-while-revalidate, return it
    if (found && staleWhileRevalidate) {
      console.warn(`Error refreshing ${key}, using stale data:`, error);
      return data as T;
    }
    
    // No stale data or not allowed to use it, throw the error
    throw error;
  }
}