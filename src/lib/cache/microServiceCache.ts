/**
 * Micro Service Cache
 * Phase 6: Production Readiness & Performance
 * 
 * In-memory cache for frequently accessed micro services
 */

interface CacheEntry {
  uuid: string;
  timestamp: number;
}

export class MicroServiceCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL_MS: number;
  private readonly MAX_SIZE: number;
  
  constructor(
    ttlMinutes: number = 30,
    maxSize: number = 100
  ) {
    this.TTL_MS = ttlMinutes * 60 * 1000;
    this.MAX_SIZE = maxSize;
  }
  
  /**
   * Get UUID from cache
   */
  get(slug: string): string | null {
    const entry = this.cache.get(slug);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL_MS) {
      this.cache.delete(slug);
      return null;
    }
    
    return entry.uuid;
  }
  
  /**
   * Set UUID in cache
   */
  set(slug: string, uuid: string): void {
    // Enforce max size with LRU eviction
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(slug, {
      uuid,
      timestamp: Date.now()
    });
  }
  
  /**
   * Check if slug is cached
   */
  has(slug: string): boolean {
    const entry = this.cache.get(slug);
    
    if (!entry) {
      return false;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL_MS) {
      this.cache.delete(slug);
      return false;
    }
    
    return true;
  }
  
  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [slug, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL_MS) {
        this.cache.delete(slug);
      }
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
      ttlMs: this.TTL_MS,
      entries: Array.from(this.cache.keys())
    };
  }
  
  /**
   * Warm up cache with common services
   */
  async warmUp(services: Array<{ slug: string; uuid: string }>): Promise<void> {
    for (const service of services) {
      this.set(service.slug, service.uuid);
    }
  }
}

// Export singleton instance
export const microServiceCache = new MicroServiceCache();

// Clear expired entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    microServiceCache.clearExpired();
  }, 5 * 60 * 1000); // Every 5 minutes
}
