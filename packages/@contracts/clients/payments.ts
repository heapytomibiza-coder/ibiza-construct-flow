/**
 * Payments API React Query Hooks
 * Auto-generated type-safe hooks for escrow operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './_http';
import { contractsKeys, Contract } from './contracts';
import { jobsKeys } from './jobs';

// Types matching contracts/src/payments.zod.ts
export interface FundEscrowResponse {
  data: Contract;
}

export interface ReleaseEscrowResponse {
  data: Contract;
}

export interface RefundEscrowResponse {
  data: Contract;
}

export interface GetEscrowBalanceResponse {
  data: number;
}

export interface GetPendingPaymentsResponse {
  data: Contract[];
}

// Query Keys Factory
export const paymentsKeys = {
  all: ['payments'] as const,
  balance: (userId: string) => [...paymentsKeys.all, 'balance', userId] as const,
  pending: (userId: string) => [...paymentsKeys.all, 'pending', userId] as const,
};

// Hooks

/**
 * Fund escrow for a contract
 */
export const useFundEscrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) =>
      apiFetch<FundEscrowResponse>(`/api/payments/escrow/${contractId}/fund`, { method: 'POST' }),
    onSuccess: (data) => {
      // Invalidate contract
      queryClient.invalidateQueries({ queryKey: contractsKeys.contract(data.data.id) });
      // Invalidate escrow balance for client
      queryClient.invalidateQueries({ queryKey: paymentsKeys.balance(data.data.clientId) });
    },
  });
};

/**
 * Release escrow payment to tasker
 */
export const useReleaseEscrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) =>
      apiFetch<ReleaseEscrowResponse>(`/api/payments/escrow/${contractId}/release`, { method: 'POST' }),
    onSuccess: (data) => {
      // Invalidate contract
      queryClient.invalidateQueries({ queryKey: contractsKeys.contract(data.data.id) });
      // Invalidate related job
      queryClient.invalidateQueries({ queryKey: jobsKeys.job(data.data.jobId) });
      // Invalidate escrow balance
      queryClient.invalidateQueries({ queryKey: paymentsKeys.balance(data.data.clientId) });
      // Invalidate pending payments
      queryClient.invalidateQueries({ queryKey: paymentsKeys.pending(data.data.taskerId) });
    },
  });
};

/**
 * Refund escrow to client
 */
export const useRefundEscrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) =>
      apiFetch<RefundEscrowResponse>(`/api/payments/escrow/${contractId}/refund`, { method: 'POST' }),
    onSuccess: (data) => {
      // Invalidate contract
      queryClient.invalidateQueries({ queryKey: contractsKeys.contract(data.data.id) });
      // Invalidate related job
      queryClient.invalidateQueries({ queryKey: jobsKeys.job(data.data.jobId) });
      // Invalidate escrow balance
      queryClient.invalidateQueries({ queryKey: paymentsKeys.balance(data.data.clientId) });
    },
  });
};

/**
 * Get current escrow balance for a user (as client)
 */
export const useGetEscrowBalance = (userId: string) => {
  return useQuery({
    queryKey: paymentsKeys.balance(userId),
    queryFn: () => apiFetch<GetEscrowBalanceResponse>(`/api/payments/escrow/balance/${userId}`, { method: 'GET' }),
    enabled: !!userId,
  });
};

/**
 * Get pending payments for a user (as tasker)
 */
export const useGetPendingPayments = (userId: string) => {
  return useQuery({
    queryKey: paymentsKeys.pending(userId),
    queryFn: () => apiFetch<GetPendingPaymentsResponse>(`/api/payments/pending/${userId}`, { method: 'GET' }),
    enabled: !!userId,
  });
};
