/**
 * React Query hooks for Question Packs API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './_http';
import type { Pack, MicroserviceDef, PackComparison } from './types';

// Query Keys
const qk = {
  packs: (params?: { slug?: string; status?: string; source?: string }) => ['packs', params] as const,
  packActive: (slug: string) => ['packs', 'active', slug] as const,
  compare: (slug: string) => ['packs', 'compare', slug] as const,
};

// LIST PACKS
export function useListPacks(params?: { slug?: string; status?: 'draft' | 'approved' | 'retired'; source?: 'manual' | 'ai' | 'hybrid' }) {
  return useQuery({
    queryKey: qk.packs(params),
    queryFn: () => apiFetch<Pack[]>('/admin/packs', { query: params }),
  });
}

// GET ACTIVE APPROVED PACK CONTENT (MicroserviceDef)
export function useActivePackContent(slug: string) {
  return useQuery({
    queryKey: qk.packActive(slug),
    queryFn: async () => {
      const pack = await apiFetch<Pack>('/admin/packs/active', { query: { slug } });
      return pack.content as MicroserviceDef;
    },
    enabled: !!slug,
  });
}

// IMPORT (approve+activate on Gate A)
export function useImportPack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { slug: string; content: MicroserviceDef; source: 'manual' | 'ai' | 'hybrid' }) =>
      apiFetch<Pack>('/admin/packs/import', { method: 'POST', body: payload }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: qk.packs({ slug: variables.slug }) });
      qc.invalidateQueries({ queryKey: qk.packActive(variables.slug) });
    },
  });
}

// APPROVE DRAFT
export function useApprovePack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (packId: string) => apiFetch<Pack>(`/admin/packs/${packId}/approve`, { method: 'POST' }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: qk.packs({ slug: data.micro_slug }) });
      qc.invalidateQueries({ queryKey: qk.compare(data.micro_slug) });
    },
  });
}

// ACTIVATE APPROVED
export function useActivatePack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (packId: string) => apiFetch<Pack>(`/admin/packs/${packId}/activate`, { method: 'POST' }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: qk.packs({ slug: data.micro_slug }) });
      qc.invalidateQueries({ queryKey: qk.packActive(data.micro_slug) });
      qc.invalidateQueries({ queryKey: qk.compare(data.micro_slug) });
    },
  });
}

// COMPARE VIEW (active vs latest draft + metrics)
export function useCompare(slug: string) {
  return useQuery({
    queryKey: qk.compare(slug),
    queryFn: () => apiFetch<PackComparison>(
      '/admin/packs/compare', { query: { slug } }
    ),
    enabled: !!slug,
  });
}

// GENERATE AI DRAFT
export function useGenerateAIDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => apiFetch<Pack>(`/admin/generate/${encodeURIComponent(slug)}`, { method: 'POST' }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: qk.packs({ slug: data.micro_slug }) });
      qc.invalidateQueries({ queryKey: qk.compare(data.micro_slug) });
    },
  });
}

// Aliases for orval-style naming convention
export const useGetAdminPacks = useListPacks;
export const usePostAdminPacksImport = useImportPack;

export function usePostAdminPacksApprove(options?: any) {
  const qc = useQueryClient();
  return useMutation<Pack, Error, { packId: string }>({
    mutationFn: ({ packId }) => apiFetch<Pack>(`/admin/packs/${packId}/approve`, { method: 'POST' }),
    onSuccess: (data: Pack) => {
      qc.invalidateQueries({ queryKey: qk.packs({ slug: data.micro_slug }) });
      qc.invalidateQueries({ queryKey: qk.compare(data.micro_slug) });
    },
    ...options,
  });
}

export function usePostAdminPacksActivate(options?: any) {
  const qc = useQueryClient();
  return useMutation<Pack, Error, { packId: string }>({
    mutationFn: ({ packId }) => apiFetch<Pack>(`/admin/packs/${packId}/activate`, { method: 'POST' }),
    onSuccess: (data: Pack) => {
      qc.invalidateQueries({ queryKey: qk.packs({ slug: data.micro_slug }) });
      qc.invalidateQueries({ queryKey: qk.packActive(data.micro_slug) });
      qc.invalidateQueries({ queryKey: qk.compare(data.micro_slug) });
    },
    ...options,
  });
}

export function usePostAdminPacksRetire(options?: any) {
  const qc = useQueryClient();
  return useMutation<Pack, Error, { packId: string }>({
    mutationFn: ({ packId }) => apiFetch<Pack>(`/admin/packs/${packId}/retire`, { method: 'POST' }),
    onSuccess: (data: Pack) => {
      qc.invalidateQueries({ queryKey: qk.packs({ slug: data.micro_slug }) });
    },
    ...options,
  });
}

export const useGetAdminPacksComparison = useCompare;
