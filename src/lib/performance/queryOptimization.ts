/**
 * Database query optimization utilities
 * Phase 6: Performance Optimization
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Optimized query client configuration
 * - Longer stale times for static data
 * - Aggressive garbage collection
 * - Optimistic updates enabled
 */
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache for 5 minutes by default
        staleTime: 5 * 60 * 1000,
        // Keep unused data for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed queries
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for real-time data
        refetchOnWindowFocus: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  });
};

/**
 * Query key factories for consistent caching
 */
export const queryKeys = {
  // User data
  profile: (userId?: string) => ['profile', userId] as const,
  profiles: (filters?: Record<string, any>) => ['profiles', filters] as const,
  
  // Jobs
  jobs: (filters?: Record<string, any>) => ['jobs', filters] as const,
  job: (jobId: string) => ['job', jobId] as const,
  jobsByClient: (clientId: string) => ['jobs', 'client', clientId] as const,
  
  // Applications
  applications: (filters?: Record<string, any>) => ['applications', filters] as const,
  applicationsByJob: (jobId: string) => ['applications', 'job', jobId] as const,
  applicationsByProfessional: (professionalId: string) => 
    ['applications', 'professional', professionalId] as const,
  
  // Contracts
  contracts: (filters?: Record<string, any>) => ['contracts', filters] as const,
  contract: (contractId: string) => ['contract', contractId] as const,
  
  // Messages
  conversations: () => ['conversations'] as const,
  conversation: (conversationId: string) => ['conversation', conversationId] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  
  // Services
  services: () => ['services'] as const,
  service: (serviceId: string) => ['service', serviceId] as const,
  
  // Reviews
  reviews: (filters?: Record<string, any>) => ['reviews', filters] as const,
  reviewsByProfessional: (professionalId: string) => 
    ['reviews', 'professional', professionalId] as const,
  
  // Admin
  adminStats: () => ['admin', 'stats'] as const,
  systemHealth: () => ['admin', 'system-health'] as const,
};

/**
 * Prefetch strategies for common navigation patterns
 */
export const prefetchStrategies = {
  // Prefetch job details when hovering over job card
  jobDetails: (queryClient: QueryClient, jobId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.job(jobId),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  // Prefetch professional profile when viewing their work
  professionalProfile: (queryClient: QueryClient, professionalId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.profile(professionalId),
      staleTime: 5 * 60 * 1000,
    });
  },
};

/**
 * Batch query helper for fetching multiple resources
 */
export const batchQuery = async <T>(
  items: string[],
  fetcher: (id: string) => Promise<T>,
  batchSize = 10
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetcher));
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Optimistic update helper
 */
export const optimisticUpdate = <T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updater: (old: T | undefined) => T
) => {
  // Cancel outgoing refetches
  queryClient.cancelQueries({ queryKey });
  
  // Snapshot previous value
  const previousValue = queryClient.getQueryData<T>(queryKey);
  
  // Optimistically update
  queryClient.setQueryData<T>(queryKey, updater);
  
  // Return rollback function
  return () => {
    queryClient.setQueryData(queryKey, previousValue);
  };
};
