/**
 * Cache Manager for AI Service
 * Provides caching with TTL support
 * 
 * Supports both Redis (for persistence across restarts) and 
 * in-memory caching (fallback when Redis is not available).
 */

import crypto from 'crypto';
import Redis from 'ioredis';

interface CacheEntry {
  value: any;
  expiresAt: number;
}

// Abstract cache storage interface
interface CacheStorage {
  get(key: string): Promise<any | null>;
  set(key: string, value: any, ttl: number): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  size(): Promise<number>;
  keys(): Promise<string[]>;
}

// In-memory storage implementation
class InMemoryStorage implements CacheStorage {
  private cache: Map<string, CacheEntry>;

  constructor() {
    this.cache = new Map();
  }

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Automatically purge if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    const expiresAt = Date.now() + ttl;
    
    this.cache.set(key, {
      value,
      expiresAt,
    });
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    // Identify expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    // Delete expired entries
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`[CacheManager] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }
}

// Redis storage implementation
class RedisStorage implements CacheStorage {
  private redis: Redis;
  private prefix: string = 'ai:cache:';

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async get(key: string): Promise<any | null> {
    try {
      const value = await this.redis.get(this.prefix + key);
      if (!value) return null;
      
      return JSON.parse(value);
    } catch (error) {
      console.error('[CacheManager] Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    try {
      const ttlInSeconds = Math.ceil(ttl / 1000);
      await this.redis.setex(
        this.prefix + key,
        ttlInSeconds,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('[CacheManager] Redis set error:', error);
      // Fail silently - caching should not break the application
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(this.prefix + key);
      return exists === 1;
    } catch (error) {
      console.error('[CacheManager] Redis has error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(this.prefix + key);
      return result === 1;
    } catch (error) {
      console.error('[CacheManager] Redis delete error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys(this.prefix + '*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('[CacheManager] Redis clear error:', error);
    }
  }

  async size(): Promise<number> {
    try {
      const keys = await this.redis.keys(this.prefix + '*');
      return keys.length;
    } catch (error) {
      console.error('[CacheManager] Redis size error:', error);
      return 0;
    }
  }

  async keys(): Promise<string[]> {
    try {
      const keys = await this.redis.keys(this.prefix + '*');
      return keys.map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('[CacheManager] Redis keys error:', error);
      return [];
    }
  }
}

export class CacheManager {
  private storage: CacheStorage;
  private defaultTTL: number; // in milliseconds
  private cleanupInterval?: NodeJS.Timeout;
  private isRedis: boolean = false;

  constructor(defaultTTL: number = 3600000) { // Default 1 hour
    this.defaultTTL = defaultTTL;
    
    // Initialize storage based on environment
    this.storage = this.initializeStorage();
    
    // Start periodic cleanup only for in-memory storage
    if (!this.isRedis) {
      this.startPeriodicCleanup();
    }
  }

  private initializeStorage(): CacheStorage {
    // Check for Redis connection string in environment
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;
    
    if (redisUrl) {
      try {
        console.log('[CacheManager] Redis URL found, attempting to connect...');
        
        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          reconnectOnError: (err) => {
            console.error('[CacheManager] Redis reconnect error:', err);
            return true; // Always try to reconnect
          },
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          }
        });

        // Handle connection events
        redis.on('connect', () => {
          console.log('[CacheManager] ✅ Connected to Redis successfully');
        });

        redis.on('error', (err) => {
          console.error('[CacheManager] Redis connection error:', err);
          // Don't throw - we'll fall back to in-memory
        });

        redis.on('close', () => {
          console.log('[CacheManager] Redis connection closed');
        });

        // Test the connection
        redis.ping().then(() => {
          console.log('[CacheManager] Redis ping successful');
          this.isRedis = true;
        }).catch((err) => {
          console.error('[CacheManager] Redis ping failed:', err);
          console.log('[CacheManager] Falling back to in-memory cache');
          this.isRedis = false;
        });

        this.isRedis = true;
        return new RedisStorage(redis);
      } catch (error) {
        console.error('[CacheManager] Failed to initialize Redis:', error);
        console.log('[CacheManager] Falling back to in-memory cache');
      }
    } else {
      console.log('[CacheManager] No Redis URL found, using in-memory cache');
    }
    
    // Fall back to in-memory storage
    return new InMemoryStorage();
  }

  /**
   * Generate cache key from prompt and options using MD5 hashing
   * @param prompt - The prompt string
   * @param options - Additional options that affect the response
   * @returns MD5 hash string to use as cache key
   */
  generateKey(prompt: string, options?: Record<string, any>): string {
    const data = {
      prompt,
      ...options,
    };
    
    return crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Get cached value
   * Automatically purges expired entries when accessed
   * @param key - Cache key to retrieve
   * @returns Cached value or null if not found/expired
   */
  async get(key: string): Promise<any | null> {
    return this.storage.get(key);
  }

  /**
   * Set cache value with optional custom TTL
   * @param key - Cache key (typically generated with generateKey())
   * @param value - Value to cache
   * @param ttl - Optional TTL in milliseconds (defaults to constructor TTL)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    return this.storage.set(key, value, ttl || this.defaultTTL);
  }

  /**
   * Clear all cache entries
   * Removes all cached responses from memory
   */
  async clear(): Promise<void> {
    return this.storage.clear();
  }

  /**
   * Get the number of entries in cache
   */
  async size(): Promise<number> {
    return this.storage.size();
  }

  /**
   * Check if a key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  /**
   * Delete a specific cache entry
   */
  async delete(key: string): Promise<boolean> {
    return this.storage.delete(key);
  }

  /**
   * Start periodic cleanup of expired entries
   * Runs every minute to prevent memory bloat
   * Only runs for in-memory storage (Redis handles TTL automatically)
   */
  private startPeriodicCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      if (this.storage instanceof InMemoryStorage) {
        this.storage.cleanup();
      }
    }, 60000); // Run every minute
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    size: number;
    type: 'redis' | 'memory';
    entries: Array<{
      key: string;
      expiresAt?: number;
    }>;
  }> {
    const size = await this.storage.size();
    const keys = await this.storage.keys();

    // For Redis, we can't easily get expiration times
    const entries = keys.map(key => ({
      key,
    }));

    return {
      size,
      type: this.isRedis ? 'redis' : 'memory',
      entries,
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    if (this.isRedis && this.storage instanceof RedisStorage) {
      // Close Redis connection
      const redis = (this.storage as any).redis;
      if (redis && typeof redis.disconnect === 'function') {
        redis.disconnect();
      }
    }
  }
}