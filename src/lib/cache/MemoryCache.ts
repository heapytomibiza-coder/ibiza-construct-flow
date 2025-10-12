/**
 * Memory Cache
 * Phase 21: Advanced Caching & Offline Support
 * 
 * In-memory caching with TTL and LRU eviction
 */

import { CacheEntry, CacheOptions } from './types';

export class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private accessOrder = new Map<string, number>();
  private maxEntries: number;
  private accessCounter = 0;

  constructor(maxEntries = 100) {
    this.maxEntries = maxEntries;
  }

  set<T>(key: string, data: T, options?: CacheOptions): void {
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: options?.ttl ? Date.now() + options.ttl : undefined,
      metadata: {
        tags: options?.tags,
        priority: options?.priority || 'normal',
      },
    };

    // Evict if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.accessOrder.set(key, ++this.accessCounter);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update access order
    this.accessOrder.set(key, ++this.accessCounter);

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) return false;

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    this.accessOrder.delete(key);
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  size(): number {
    return this.cache.size;
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    
    this.cache.forEach((entry, key) => {
      if (entry.metadata?.tags?.includes(tag)) {
        this.delete(key);
        count++;
      }
    });

    return count;
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruAccess = Infinity;

    this.accessOrder.forEach((access, key) => {
      if (access < lruAccess) {
        lruAccess = access;
        lruKey = key;
      }
    });

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (entry.expiresAt && now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
  }
}
