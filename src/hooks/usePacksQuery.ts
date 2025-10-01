/**
 * Standardized React Query hooks for question packs
 * Uses consistent query keys and integrates with Zustand UI state
 * Will be replaced by generated hooks from @contracts/clients in Phase 1 completion
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listPacks,
  importPack,
  approvePack,
  activatePack,
  retirePack,
  getPackComparison,
  getPackMetrics,
} from '@/lib/api/questionPacks';
import { Pack, PackStatus, PackSource, MicroserviceDef } from '@/types/packs';

// Standardized query keys
export const packKeys = {
  all: ['packs'] as const,
  lists: () => [...packKeys.all, 'list'] as const,
  list: (filters: { status?: PackStatus; source?: PackSource; slug?: string }) =>
    [...packKeys.lists(), filters] as const,
  comparison: (slug: string) => [...packKeys.all, 'comparison', slug] as const,
  metrics: (packId: string) => [...packKeys.all, 'metrics', packId] as const,
};

// List packs with filters
export function useListPacks(filters: { status?: PackStatus; source?: PackSource; slug?: string } = {}) {
  return useQuery({
    queryKey: packKeys.list(filters),
    queryFn: () => listPacks(filters),
  });
}

// Import pack
export function useImportPack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      slug: string;
      content: MicroserviceDef;
      source: 'manual' | 'ai' | 'hybrid';
      status?: 'draft' | 'approved';
    }) => importPack(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packKeys.lists() });
      toast.success('Pack imported successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to import pack: ${error.message}`);
    },
  });
}

// Approve pack
export function useApprovePack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packId: string) => approvePack(packId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packKeys.lists() });
      toast.success('Pack approved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve pack: ${error.message}`);
    },
  });
}

// Activate pack
export function useActivatePack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packId: string) => activatePack(packId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packKeys.lists() });
      toast.success('Pack activated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to activate pack: ${error.message}`);
    },
  });
}

// Retire pack
export function useRetirePack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packId: string) => retirePack(packId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packKeys.lists() });
      toast.success('Pack retired successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to retire pack: ${error.message}`);
    },
  });
}

// Get pack comparison
export function usePackComparison(slug: string) {
  return useQuery({
    queryKey: packKeys.comparison(slug),
    queryFn: () => getPackComparison(slug),
    enabled: !!slug,
  });
}

// Get pack metrics
export function usePackMetrics(packId: string) {
  return useQuery({
    queryKey: packKeys.metrics(packId),
    queryFn: () => getPackMetrics(packId),
    enabled: !!packId,
  });
}
