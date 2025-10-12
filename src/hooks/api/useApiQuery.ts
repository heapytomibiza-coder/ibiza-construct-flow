/**
 * Standardized API Query Hook
 * Phase 12: API Client Standardization & React Query Integration
 * 
 * Wrapper around useQuery with consistent error handling and loading states
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { APIError, APIResponse } from '@/lib/api/client';
import { toast } from '@/hooks/use-toast';

interface UseApiQueryOptions<TData> {
  showErrorToast?: boolean;
  errorMessage?: string;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
}

/**
 * Enhanced useQuery hook with standardized error handling
 */
export function useApiQuery<TData>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<APIResponse<TData>>,
  options?: UseApiQueryOptions<TData>
): UseQueryResult<TData, APIError> {
  const { showErrorToast = true, errorMessage, ...queryOptions } = options || {};

  return useQuery<TData, APIError>({
    queryKey: queryKey as any,
    queryFn: async () => {
      const response = await queryFn();
      
      if (response.error) {
        if (showErrorToast) {
          toast({
            title: 'Error',
            description: errorMessage || response.error.message,
            variant: 'destructive',
          });
        }
        throw response.error;
      }

      if (response.data === null) {
        throw new APIError('No data returned', 404, 'NO_DATA');
      }

      return response.data;
    },
    ...queryOptions,
  } as any);
}
