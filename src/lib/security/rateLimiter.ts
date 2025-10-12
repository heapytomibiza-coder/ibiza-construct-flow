/**
 * Rate Limiter
 * Phase 24: Advanced Security & Authorization System
 */

import { RateLimitConfig, RateLimitStatus } from './types';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record || now >= record.resetAt) {
      this.records.set(key, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return true;
    }

    if (record.count < this.config.maxRequests) {
      record.count++;
      return true;
    }

    return false;
  }

  getStatus(key: string): RateLimitStatus {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record || now >= record.resetAt) {
      return {
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: now + this.config.windowMs,
      };
    }

    return {
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - record.count),
      reset: record.resetAt,
    };
  }

  reset(key: string): void {
    this.records.delete(key);
  }
}

export function createRateLimiter(preset: 'strict' | 'moderate' | 'lenient'): RateLimiter {
  const presets: Record<string, RateLimitConfig> = {
    strict: { maxRequests: 10, windowMs: 60000 },
    moderate: { maxRequests: 30, windowMs: 60000 },
    lenient: { maxRequests: 100, windowMs: 60000 },
  };
  return new RateLimiter(presets[preset]);
}

export const apiRateLimiter = createRateLimiter('moderate');
export const authRateLimiter = createRateLimiter('strict');
