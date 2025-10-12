/**
 * Cache Hook
 * Phase 21: Advanced Caching & Offline Support
 * 
 * React hook for cached data fetching
 */

import { useState, useEffect, useCallback } from 'react';
import { cacheManager, CacheStrategy, CacheOptions } from '@/lib/cache';

interface UseCacheOptions<T> extends CacheOptions {
  strategy?: CacheStrategy;
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: UseCacheOptions<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    try {
      const result = await cacheManager.get(key, fetcher, {
        strategy: options?.strategy,
        ttl: options?.ttl,
        tags: options?.tags,
        priority: options?.priority,
      });

      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options?.onError?.(error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [key, fetcher, options]);

  useEffect(() => {
    if (options?.enabled === false) {
      setIsLoading(false);
      return;
    }

    fetchData();

    // Auto-refetch on interval
    if (options?.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [key, options?.enabled, options?.refetchInterval, fetchData]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const invalidate = useCallback(async () => {
    await cacheManager.delete(key);
    return fetchData();
  }, [key, fetchData]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    invalidate,
  };
}
