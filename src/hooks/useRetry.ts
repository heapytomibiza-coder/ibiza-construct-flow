import { useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

export function useRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
) {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = 'exponential',
    onRetry
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      setAttemptCount(0);
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          setAttemptCount(attempt);
          const result = await fn(...args);
          setIsRetrying(false);
          return result;
        } catch (error) {
          logger.warn(`Attempt ${attempt} failed`, { error, args });

          if (attempt === maxAttempts) {
            setIsRetrying(false);
            throw error;
          }

          setIsRetrying(true);
          
          if (onRetry) {
            onRetry(attempt, error as Error);
          }

          // Calculate delay
          const delay = backoff === 'exponential' 
            ? delayMs * Math.pow(2, attempt - 1)
            : delayMs * attempt;

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      throw new Error('Max attempts reached');
    },
    [fn, maxAttempts, delayMs, backoff, onRetry]
  );

  const reset = useCallback(() => {
    setIsRetrying(false);
    setAttemptCount(0);
  }, []);

  return {
    execute,
    isRetrying,
    attemptCount,
    reset
  };
}
