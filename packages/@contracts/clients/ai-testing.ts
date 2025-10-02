/**
 * React Query hooks for AI Testing API
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from './_http';
import type { Pack } from './types';

export interface TestExecutionRequest {
  testSuites?: Array<'database' | 'edge-functions' | 'storage' | 'templates'>;
  includeI18n?: boolean;
}

export interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  message?: string;
  duration?: number;
}

export interface TestExecutionResponse {
  results: TestResult[];
  logs: string[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
  };
}

// List AI-generated drafts
export function useListAIDrafts(slug?: string) {
  return useQuery({
    queryKey: ['ai', 'drafts', slug],
    queryFn: () => apiFetch<Pack[]>('/admin/ai/drafts', { query: { slug } }),
  });
}

// Run AI generation test
export function useRunAIGenerationTest() {
  return useMutation({
    mutationFn: (payload: { slug: string; shots?: number; temperature?: number }) =>
      apiFetch<{ ok: true; pack: Pack }>('/admin/ai/test', { method: 'POST', body: payload }),
  });
}

// Execute comprehensive test suite
export function useExecuteTests() {
  return useMutation({
    mutationFn: (payload: TestExecutionRequest) =>
      apiFetch<TestExecutionResponse>('/admin/ai/execute-tests', { method: 'POST', body: payload }),
  });
}
