/**
 * Standardized API Mutation Hook
 * Phase 12: API Client Standardization & React Query Integration
 * 
 * Wrapper around useMutation with consistent error handling and success feedback
 */

import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { APIError, APIResponse } from '@/lib/api/client';
import { toast } from '@/hooks/use-toast';

interface UseApiMutationOptions<TData, TVariables> 
  extends Omit<UseMutationOptions<TData, APIError, TVariables>, 'mutationFn'> {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  errorMessage?: string;
  successMessage?: string;
}

/**
 * Enhanced useMutation hook with standardized error handling and success feedback
 */
export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<APIResponse<TData>>,
  options?: UseApiMutationOptions<TData, TVariables>
): UseMutationResult<TData, APIError, TVariables> {
  const {
    showErrorToast = true,
    showSuccessToast = false,
    errorMessage,
    successMessage,
    onSuccess,
    onError,
    ...mutationOptions
  } = options || {};

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await mutationFn(variables);
      
      if (response.error) {
        throw response.error;
      }

      if (response.data === null) {
        throw new APIError('No data returned', 500, 'NO_DATA');
      }

      return response.data;
    },
    onSuccess: (data, variables, context) => {
      if (showSuccessToast && successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: errorMessage || error.message,
          variant: 'destructive',
        });
      }
      onError?.(error, variables, context);
    },
    ...mutationOptions,
  });
}
