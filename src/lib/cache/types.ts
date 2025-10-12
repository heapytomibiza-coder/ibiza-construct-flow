/**
 * Cache System Types
 * Phase 21: Advanced Caching & Offline Support
 * 
 * Type definitions for caching and offline functionality
 */

export type CacheStrategy = 
  | 'cache-first'
  | 'network-first'
  | 'cache-only'
  | 'network-only'
  | 'stale-while-revalidate';

export interface CacheConfig {
  name: string;
  version: number;
  strategy: CacheStrategy;
  maxAge?: number; // milliseconds
  maxEntries?: number;
}

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt?: number;
  metadata?: Record<string, any>;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[];
  priority?: 'high' | 'normal' | 'low';
}

export interface OfflineQueueItem {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries?: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
}

export interface StorageQuota {
  usage: number;
  quota: number;
  percentage: number;
}

export interface SyncTask {
  id: string;
  name: string;
  handler: () => Promise<void>;
  interval?: number; // milliseconds
  lastRun?: Date;
  nextRun?: Date;
}
