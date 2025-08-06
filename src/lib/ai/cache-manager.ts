/**
 * Cache Manager for AI Service
 * Provides in-memory caching with TTL support
 * 
 * TODO: Upgrade to Redis for distributed caching and persistence
 * This would allow cache sharing across multiple instances and
 * survive application restarts.
 */

import crypto from 'crypto';

interface CacheEntry {
  value: any;
  expiresAt: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number; // in milliseconds

  constructor(defaultTTL: number = 3600000) { // Default 1 hour
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    
    // Start periodic cleanup of expired entries
    this.startPeriodicCleanup();
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
  get(key: string): any | null {
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

  /**
   * Set cache value with optional custom TTL
   * @param key - Cache key (typically generated with generateKey())
   * @param value - Value to cache
   * @param ttl - Optional TTL in milliseconds (defaults to constructor TTL)
   */
  set(key: string, value: any, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      value,
      expiresAt,
    });
  }

  /**
   * Clear all cache entries
   * Removes all cached responses from memory
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of entries in cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Start periodic cleanup of expired entries
   * Runs every minute to prevent memory bloat
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
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
    }, 60000); // Run every minute
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: Array<{
      key: string;
      expiresAt: number;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      expiresAt: entry.expiresAt,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }
}