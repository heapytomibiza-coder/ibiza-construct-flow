/**
 * React Query hooks for Professional Matching API
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from './_http';

export interface MatchRequest {
  slug: string; 
  pack_id: string; 
  answers: Record<string, any>; 
  location?: string; 
  radius_km?: number;
}

export interface MatchCandidate {
  professional_id: string; 
  score: number; 
  reasons: string[]; 
  distance_km?: number;
}

export interface MatchPreview { 
  top: MatchCandidate[]; 
  cutoff_score: number; 
  total_candidates: number; 
}

export interface JobMatchRequest {
  jobRequirements: {
    title: string;
    description: string;
    skills: string[];
  };
  location?: string;
  budget?: number;
  urgency?: string;
}

export interface ProfessionalMatchResponse {
  matches: Array<{
    professionalId: string;
    name: string;
    matchScore: number;
    explanation: string;
    strengths: string[];
    concerns: string[];
  }>;
}

// Match preview (pack-based)
export function useMatchPreview(payload?: MatchRequest) {
  return useQuery({
    queryKey: ['matching', 'preview', payload?.slug, payload?.pack_id],
    queryFn: () => apiFetch<MatchPreview>('/admin/matching/preview', { method: 'POST', body: payload }),
    enabled: !!payload?.slug && !!payload?.pack_id,
  });
}

// Finalize match (pack-based)
export function useMatchFinalize() {
  return useMutation({
    mutationFn: (payload: MatchRequest) =>
      apiFetch<{ notified: number; top_k: MatchCandidate[] }>('/admin/matching/finalize', {
        method: 'POST',
        body: payload,
      }),
  });
}

// Match professionals (job-based - legacy)
export function useMatchProfessionals() {
  return useMutation({
    mutationFn: (payload: JobMatchRequest) =>
      apiFetch<ProfessionalMatchResponse>('/admin/matching/match-professionals', {
        method: 'POST',
        body: payload,
      }),
  });
}
