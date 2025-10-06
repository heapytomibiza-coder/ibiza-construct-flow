/**
 * Client-side rate limiting
 * Prevents abuse and excessive API calls
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();

  /**
   * Check if request is allowed
   */
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.requests.get(key);

    // No record or expired window
    if (!record || now >= record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Within window, check count
    if (record.count < config.maxRequests) {
      record.count++;
      return true;
    }

    // Rate limit exceeded
    return false;
  }

  /**
   * Get time until rate limit resets
   */
  getResetTime(key: string): number {
    const record = this.requests.get(key);
    if (!record) return 0;
    
    return Math.max(0, record.resetTime - Date.now());
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations
 */
export const rateLimitConfigs = {
  api: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
  search: {
    maxRequests: 30,
    windowMs: 60000, // 1 minute
  },
  upload: {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  },
  message: {
    maxRequests: 50,
    windowMs: 60000, // 1 minute
  },
};

/**
 * React hook for rate limiting
 */
export function useRateLimit(
  key: string,
  config: RateLimitConfig = rateLimitConfigs.api
) {
  const checkLimit = () => {
    const allowed = rateLimiter.isAllowed(key, config);
    
    if (!allowed) {
      const resetTime = rateLimiter.getResetTime(key);
      const seconds = Math.ceil(resetTime / 1000);
      throw new Error(`Rate limit exceeded. Try again in ${seconds} seconds.`);
    }
    
    return allowed;
  };

  return { checkLimit };
}
