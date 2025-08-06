/**
 * Cache Manager for AI Service
 * Provides in-memory caching with TTL support
 */

import { CacheEntry } from './types';
import crypto from 'crypto';

export class CacheManager {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private defaultTTL: number;

  constructor(defaultTTL: number = 3600000, maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Generate cache key from prompt and options
   */
  generateKey(prompt: string, options?: Record<string, any>): string {
    const data = {
      prompt,
      ...options,
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Get cached value
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set cache value
   */
  set(key: string, value: any, ttl?: number, metadata?: Record<string, any>): void {
    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries
      const entriesToRemove = Math.floor(this.maxSize * 0.2); // Remove 20%
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].expires - b[1].expires);
      
      for (let i = 0; i < entriesToRemove; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }

    const entry: CacheEntry = {
      key,
      value,
      expires: Date.now() + (ttl || this.defaultTTL),
      metadata,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const value = this.get(key);
    return value !== null;
  }

  /**
   * Clear specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      key: string;
      expires: number;
      metadata?: Record<string, any>;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      expires: entry.expires,
      metadata: entry.metadata,
    }));

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses for this
      entries,
    };
  }

  /**
   * Start interval to clean up expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, entry] of this.cache.entries()) {
        if (entry.expires < now) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.cache.delete(key));
    }, 60000); // Run every minute
  }

  /**
   * Cache decorator for async functions
   */
  async withCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
    metadata?: Record<string, any>
  ): Promise<{ value: T; cached: boolean }> {
    // Check cache first
    const cached = this.get(key);
    if (cached !== null) {
      return { value: cached, cached: true };
    }

    // Execute function
    const value = await fn();

    // Cache the result
    this.set(key, value, ttl, metadata);

    return { value, cached: false };
  }
}