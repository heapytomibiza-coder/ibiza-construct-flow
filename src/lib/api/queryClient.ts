/**
 * React Query Client Configuration
 * Phase 12: API Client Standardization & React Query Integration
 * 
 * Centralized query client with optimized defaults
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default query configuration
 */
const queryConfig = {
  queries: {
    // Cache data for 5 minutes by default
    staleTime: 5 * 60 * 1000,
    
    // Keep unused data in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    
    // Retry failed requests 3 times with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Don't refetch on window focus by default
    refetchOnWindowFocus: false,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Refetch on mount if data is stale
    refetchOnMount: true,
  },
  mutations: {
    // Retry mutations once on failure
    retry: 1,
    retryDelay: 1000,
  },
};

/**
 * Create configured query client
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
};

/**
 * Query client singleton for app-wide use
 */
export const queryClient = createQueryClient();

/**
 * Query invalidation helpers
 */
export const invalidateQueries = {
  /**
   * Invalidate all job-related queries
   */
  jobs: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  
  /**
   * Invalidate specific job
   */
  job: (id: string) => queryClient.invalidateQueries({ queryKey: ['jobs', 'detail', id] }),
  
  /**
   * Invalidate all professional-related queries
   */
  professionals: () => queryClient.invalidateQueries({ queryKey: ['professionals'] }),
  
  /**
   * Invalidate specific professional
   */
  professional: (id: string) => queryClient.invalidateQueries({ queryKey: ['professionals', 'detail', id] }),
  
  /**
   * Invalidate all service-related queries
   */
  services: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  
  /**
   * Invalidate messages
   */
  messages: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  
  /**
   * Invalidate notifications
   */
  notifications: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
};

/**
 * Optimistic update helpers
 */
export const optimisticUpdate = {
  /**
   * Update query data optimistically
   */
  async updateData<T>(
    queryKey: any[],
    updater: (oldData: T | undefined) => T
  ) {
    await queryClient.cancelQueries({ queryKey });
    
    const previousData = queryClient.getQueryData<T>(queryKey);
    
    queryClient.setQueryData<T>(queryKey, updater(previousData));
    
    return { previousData };
  },
  
  /**
   * Rollback on error
   */
  rollback<T>(queryKey: any[], previousData: T | undefined) {
    queryClient.setQueryData<T>(queryKey, previousData);
  },
};
