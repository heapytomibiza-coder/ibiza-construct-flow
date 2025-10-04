/**
 * Generated Jobs API Client (React Query hooks)
 * Phase 12: Complete API Standardization
 */

import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import { apiFetch } from './_http';

// ===== Types =====

export interface DraftJob {
  title: string;
  description?: string;
  micro_id: string;
  answers: Record<string, any>;
  location?: Record<string, any>;
  budget_type: 'fixed' | 'hourly';
  budget_value?: number;
}

export interface Job {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  micro_id: string;
  answers: Record<string, any>;
  location: Record<string, any> | null;
  budget_type: 'fixed' | 'hourly';
  budget_value: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SaveDraftResponse {
  draftId: string;
}

export interface PublishJobResponse {
  job: Job;
}

export interface GetJobResponse {
  job: Job;
}

export interface GetJobsByClientResponse {
  jobs: Job[];
}

export interface GetOpenJobsResponse {
  jobs: Job[];
}

// ===== Query Keys =====

export const jobsKeys = {
  all: ['jobs'] as const,
  job: (id: string) => [...jobsKeys.all, 'detail', id] as const,
  byClient: (clientId: string) => [...jobsKeys.all, 'client', clientId] as const,
  open: () => [...jobsKeys.all, 'open'] as const,
};

// ===== Hooks =====

/**
 * Save job draft to localStorage
 */
export function useSaveDraft(
  options?: UseMutationOptions<SaveDraftResponse, Error, { draft: DraftJob }>
) {
  return useMutation({
    mutationFn: async ({ draft }) => {
      return apiFetch<SaveDraftResponse>('/api/jobs/draft', {
        method: 'POST',
        body: { draft },
      });
    },
    ...options,
  });
}

/**
 * Publish a job
 */
export function usePublishJob(
  options?: UseMutationOptions<PublishJobResponse, Error, { draft: DraftJob }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ draft }) => {
      return apiFetch<PublishJobResponse>('/api/jobs/publish', {
        method: 'POST',
        body: { draft },
      });
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: jobsKeys.all });
      queryClient.invalidateQueries({ queryKey: jobsKeys.byClient(data.job.client_id) });
      queryClient.invalidateQueries({ queryKey: jobsKeys.open() });
    },
    ...options,
  });
}

/**
 * Get job by ID
 */
export function useGetJob(
  jobId: string,
  options?: Omit<UseQueryOptions<GetJobResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: jobsKeys.job(jobId),
    queryFn: () => apiFetch<GetJobResponse>(`/api/jobs/${jobId}`),
    ...options,
  });
}

/**
 * Get jobs by client
 */
export function useGetJobsByClient(
  clientId: string,
  options?: Omit<UseQueryOptions<GetJobsByClientResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: jobsKeys.byClient(clientId),
    queryFn: () => apiFetch<GetJobsByClientResponse>(`/api/jobs/client/${clientId}`),
    ...options,
  });
}

/**
 * Get all open jobs
 */
export function useGetOpenJobs(
  options?: Omit<UseQueryOptions<GetOpenJobsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: jobsKeys.open(),
    queryFn: () => apiFetch<GetOpenJobsResponse>('/api/jobs/open'),
    ...options,
  });
}
