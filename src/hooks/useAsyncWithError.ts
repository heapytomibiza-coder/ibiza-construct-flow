/**
 * Hook for handling async operations with error handling and loading states
 */
import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { retryWithBackoff } from '@/utils/errorUtils';

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  retry?: boolean;
  maxRetries?: number;
}

export const useAsyncWithError = <T = any, A extends any[] = any[]>(
  asyncFunction: (...args: A) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { handleError } = useErrorHandler();
  
  const execute = useCallback(async (...args: A) => {
    setLoading(true);
    setError(null);
    
    try {
      let result: T;
      
      if (options.retry) {
        result = await retryWithBackoff(
          () => asyncFunction(...args),
          {
            maxRetries: options.maxRetries || 3,
            onRetry: (attempt, error) => {
              console.log(`Retry attempt ${attempt}:`, error);
            }
          }
        );
      } else {
        result = await asyncFunction(...args);
      }
      
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      handleError(error, { functionName: asyncFunction.name, args });
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, handleError, options]);
  
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);
  
  return {
    execute,
    loading,
    error,
    data,
    reset
  };
};
