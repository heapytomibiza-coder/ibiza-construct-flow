/**
 * Cache Manager
 * Phase 21: Advanced Caching & Offline Support
 * 
 * Unified cache manager with multiple strategies
 */

import { MemoryCache } from './MemoryCache';
import { IndexedDBCache } from './IndexedDBCache';
import { CacheStrategy, CacheOptions } from './types';

export class CacheManager {
  private memoryCache: MemoryCache;
  private persistentCache: IndexedDBCache;
  private defaultStrategy: CacheStrategy;

  constructor(strategy: CacheStrategy = 'cache-first') {
    this.memoryCache = new MemoryCache(100);
    this.persistentCache = new IndexedDBCache();
    this.defaultStrategy = strategy;
  }

  async initialize(): Promise<void> {
    await this.persistentCache.initialize();
  }

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions & { strategy?: CacheStrategy }
  ): Promise<T> {
    const strategy = options?.strategy || this.defaultStrategy;

    switch (strategy) {
      case 'cache-first':
        return this.cacheFirst(key, fetcher, options);
      
      case 'network-first':
        return this.networkFirst(key, fetcher, options);
      
      case 'cache-only':
        return this.cacheOnly(key);
      
      case 'network-only':
        return this.networkOnly(key, fetcher, options);
      
      case 'stale-while-revalidate':
        return this.staleWhileRevalidate(key, fetcher, options);
      
      default:
        return this.cacheFirst(key, fetcher, options);
    }
  }

  async set<T>(key: string, data: T, options?: CacheOptions): Promise<void> {
    // Set in memory cache
    this.memoryCache.set(key, data, options);

    // Set in persistent cache
    await this.persistentCache.set(key, data, options);
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await this.persistentCache.delete(key);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    await this.persistentCache.clear();
  }

  async invalidateByTag(tag: string): Promise<void> {
    this.memoryCache.invalidateByTag(tag);
    // Note: IndexedDB doesn't support tag-based invalidation efficiently
    // This would require iterating all entries
  }

  private async cacheFirst<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try memory cache first
    const memData = this.memoryCache.get<T>(key);
    if (memData !== null) return memData;

    // Try persistent cache
    const persistData = await this.persistentCache.get<T>(key);
    if (persistData !== null) {
      // Populate memory cache
      this.memoryCache.set(key, persistData, options);
      return persistData;
    }

    // Fetch from network
    const data = await fetcher();
    await this.set(key, data, options);
    return data;
  }

  private async networkFirst<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    try {
      // Try network first
      const data = await fetcher();
      await this.set(key, data, options);
      return data;
    } catch (error) {
      // Fallback to cache
      const memData = this.memoryCache.get<T>(key);
      if (memData !== null) return memData;

      const persistData = await this.persistentCache.get<T>(key);
      if (persistData !== null) return persistData;

      throw error;
    }
  }

  private async cacheOnly<T>(key: string): Promise<T> {
    const memData = this.memoryCache.get<T>(key);
    if (memData !== null) return memData;

    const persistData = await this.persistentCache.get<T>(key);
    if (persistData !== null) return persistData;

    throw new Error(`Cache miss: ${key}`);
  }

  private async networkOnly<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const data = await fetcher();
    await this.set(key, data, options);
    return data;
  }

  private async staleWhileRevalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Return cached data immediately if available
    const memData = this.memoryCache.get<T>(key);
    if (memData !== null) {
      // Revalidate in background
      fetcher().then(data => this.set(key, data, options)).catch(() => {});
      return memData;
    }

    const persistData = await this.persistentCache.get<T>(key);
    if (persistData !== null) {
      // Revalidate in background
      fetcher().then(data => this.set(key, data, options)).catch(() => {});
      return persistData;
    }

    // No cache, fetch from network
    const data = await fetcher();
    await this.set(key, data, options);
    return data;
  }
}

export const cacheManager = new CacheManager();
