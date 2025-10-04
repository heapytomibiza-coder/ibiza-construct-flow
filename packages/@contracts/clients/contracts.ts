/**
 * Contracts API React Query Hooks
 * Auto-generated type-safe hooks for contract lifecycle management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './_http';
import { jobsKeys } from './jobs';

// Types matching contracts/src/contracts.zod.ts
export interface Contract {
  id: string;
  jobId: string;
  taskerId: string;
  clientId: string;
  type: 'fixed' | 'hourly';
  agreedAmount: number;
  escrowStatus: 'none' | 'funded' | 'released' | 'refunded';
  startAt?: string;
  endAt?: string;
}

export interface CreateFromOfferRequest {
  offerId: string;
}

export interface CreateFromOfferResponse {
  data: Contract;
}

export interface GetContractResponse {
  data: Contract;
}

export interface GetContractsByUserResponse {
  data: Contract[];
}

export interface MarkInProgressResponse {
  data: Contract;
}

export interface SubmitCompletionResponse {
  data: Contract;
}

// Query Keys Factory
export const contractsKeys = {
  all: ['contracts'] as const,
  contract: (id: string) => [...contractsKeys.all, 'contract', id] as const,
  byUser: (userId: string) => [...contractsKeys.all, 'user', userId] as const,
};

// Hooks

/**
 * Create a contract from an accepted offer
 */
export const useCreateFromOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateFromOfferRequest) =>
      apiFetch<CreateFromOfferResponse>('/api/contracts/from-offer', { method: 'POST', body: request }),
    onSuccess: (data) => {
      // Invalidate related job queries
      queryClient.invalidateQueries({ queryKey: jobsKeys.job(data.data.jobId) });
      queryClient.invalidateQueries({ queryKey: jobsKeys.openJobs() });
      // Invalidate user contracts
      queryClient.invalidateQueries({ queryKey: contractsKeys.byUser(data.data.clientId) });
      queryClient.invalidateQueries({ queryKey: contractsKeys.byUser(data.data.taskerId) });
    },
  });
};

/**
 * Get a single contract by ID
 */
export const useGetContract = (contractId: string) => {
  return useQuery({
    queryKey: contractsKeys.contract(contractId),
    queryFn: () => apiFetch<GetContractResponse>(`/api/contracts/${contractId}`, { method: 'GET' }),
    enabled: !!contractId,
  });
};

/**
 * Get all contracts for a specific user (as client or tasker)
 */
export const useGetContractsByUser = (userId: string) => {
  return useQuery({
    queryKey: contractsKeys.byUser(userId),
    queryFn: () => apiFetch<GetContractsByUserResponse>(`/api/contracts/user/${userId}`, { method: 'GET' }),
    enabled: !!userId,
  });
};

/**
 * Mark a contract as in progress
 */
export const useMarkInProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) =>
      apiFetch<MarkInProgressResponse>(`/api/contracts/${contractId}/in-progress`, { method: 'POST' }),
    onSuccess: (data) => {
      // Invalidate contract
      queryClient.invalidateQueries({ queryKey: contractsKeys.contract(data.data.id) });
      // Invalidate related job
      queryClient.invalidateQueries({ queryKey: jobsKeys.job(data.data.jobId) });
      // Invalidate user contracts
      queryClient.invalidateQueries({ queryKey: contractsKeys.byUser(data.data.clientId) });
      queryClient.invalidateQueries({ queryKey: contractsKeys.byUser(data.data.taskerId) });
    },
  });
};

/**
 * Submit contract completion
 */
export const useSubmitCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) =>
      apiFetch<SubmitCompletionResponse>(`/api/contracts/${contractId}/complete`, { method: 'POST' }),
    onSuccess: (data) => {
      // Invalidate contract
      queryClient.invalidateQueries({ queryKey: contractsKeys.contract(data.data.id) });
      // Invalidate related job
      queryClient.invalidateQueries({ queryKey: jobsKeys.job(data.data.jobId) });
      // Invalidate user contracts
      queryClient.invalidateQueries({ queryKey: contractsKeys.byUser(data.data.clientId) });
      queryClient.invalidateQueries({ queryKey: contractsKeys.byUser(data.data.taskerId) });
    },
  });
};
