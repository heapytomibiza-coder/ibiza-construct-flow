/**
 * Offers API React Query Hooks
 * Auto-generated type-safe hooks for offer management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './_http';
import { jobsKeys } from './jobs';

// Types matching contracts/src/offers.zod.ts
export interface Offer {
  id: string;
  jobId: string;
  taskerId: string;
  message?: string;
  amount: number;
  type: 'fixed' | 'hourly';
  status: 'sent' | 'accepted' | 'declined' | 'withdrawn' | 'expired';
  createdAt: string;
}

export interface SendOfferRequest {
  jobId: string;
  amount: number;
  type: 'fixed' | 'hourly';
  message?: string;
}

export interface SendOfferResponse {
  data: Offer;
}

export interface ListOffersForJobResponse {
  data: Offer[];
}

export interface AcceptOfferResponse {
  data: Offer;
}

export interface DeclineOfferResponse {
  data: Offer;
}

export interface GetOffersByTaskerResponse {
  data: Offer[];
}

// Query Keys Factory
export const offersKeys = {
  all: ['offers'] as const,
  forJob: (jobId: string) => [...offersKeys.all, 'job', jobId] as const,
  byTasker: (taskerId: string) => [...offersKeys.all, 'tasker', taskerId] as const,
};

// Hooks

/**
 * Send a new offer to a job
 */
export const useSendOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendOfferRequest) =>
      apiFetch<SendOfferResponse>('/api/offers', { method: 'POST', body: request }),
    onSuccess: (data) => {
      // Invalidate job offers
      queryClient.invalidateQueries({ queryKey: offersKeys.forJob(data.data.jobId) });
      // Invalidate the specific job
      queryClient.invalidateQueries({ queryKey: jobsKeys.job(data.data.jobId) });
    },
  });
};

/**
 * List all offers for a specific job
 */
export const useListOffersForJob = (jobId: string) => {
  return useQuery({
    queryKey: offersKeys.forJob(jobId),
    queryFn: () => apiFetch<ListOffersForJobResponse>(`/api/offers/job/${jobId}`, { method: 'GET' }),
    enabled: !!jobId,
  });
};

/**
 * Accept an offer
 */
export const useAcceptOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) =>
      apiFetch<AcceptOfferResponse>(`/api/offers/${offerId}/accept`, { method: 'POST' }),
    onSuccess: (data) => {
      // Invalidate all offers for this job
      queryClient.invalidateQueries({ queryKey: offersKeys.forJob(data.data.jobId) });
      // Invalidate the job itself (status changes)
      queryClient.invalidateQueries({ queryKey: jobsKeys.job(data.data.jobId) });
      // Invalidate open jobs list
      queryClient.invalidateQueries({ queryKey: jobsKeys.open() });
    },
  });
};

/**
 * Decline an offer
 */
export const useDeclineOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) =>
      apiFetch<DeclineOfferResponse>(`/api/offers/${offerId}/decline`, { method: 'POST' }),
    onSuccess: (data) => {
      // Invalidate offers for this job
      queryClient.invalidateQueries({ queryKey: offersKeys.forJob(data.data.jobId) });
    },
  });
};

/**
 * Get all offers submitted by a specific tasker
 */
export const useGetOffersByTasker = (taskerId: string) => {
  return useQuery({
    queryKey: offersKeys.byTasker(taskerId),
    queryFn: () => apiFetch<GetOffersByTaskerResponse>(`/api/offers/tasker/${taskerId}`, { method: 'GET' }),
    enabled: !!taskerId,
  });
};
