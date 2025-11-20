/**
 * UUID Lookup Retry Logic
 * Phase 6: Production Readiness & Error Handling
 * 
 * Implements exponential backoff retry strategy for UUID lookups
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 2000,
  backoffMultiplier: 2
};

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Determine if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network/connection errors are retryable
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    ) {
      return true;
    }
    
    // Database busy/locked errors are retryable
    if (
      message.includes('lock') ||
      message.includes('busy') ||
      message.includes('concurrent')
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Retry a UUID lookup operation with exponential backoff
 */
export async function retryUUIDLookup<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetry?: (attempt: number, error: unknown) => void
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if not a retryable error
      if (!isRetryableError(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }
      
      // Calculate delay and wait
      const delay = calculateDelay(attempt, config);
      
      if (onRetry) {
        onRetry(attempt, error);
      }
      
      console.log(`[UUID Lookup] Retry attempt ${attempt}/${config.maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Retry with circuit breaker pattern
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private failureThreshold: number = 5,
    private resetTimeoutMs: number = 60000
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit should reset
    if (
      this.state === 'open' &&
      Date.now() - this.lastFailureTime >= this.resetTimeoutMs
    ) {
      this.state = 'half-open';
      this.failures = 0;
    }
    
    // Reject if circuit is open
    if (this.state === 'open') {
      throw new Error('Circuit breaker is open - too many failures');
    }
    
    try {
      const result = await operation();
      
      // Success - close circuit
      if (this.state === 'half-open') {
        this.state = 'closed';
      }
      this.failures = 0;
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      // Open circuit if threshold reached
      if (this.failures >= this.failureThreshold) {
        this.state = 'open';
        console.error('[Circuit Breaker] Opening circuit after', this.failures, 'failures');
      }
      
      throw error;
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
  
  reset() {
    this.state = 'closed';
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

// Global circuit breaker instance for UUID lookups
export const uuidLookupCircuitBreaker = new CircuitBreaker(5, 60000);
