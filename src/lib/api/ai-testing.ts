/**
 * AI Testing API Adapter
 * Adapts Supabase Edge Functions to contract-first API
 */

import { supabase } from '@/integrations/supabase/client';

export interface GenerateQuestionsRequest {
  serviceType: string;
  category: string;
  subcategory: string;
}

export interface EstimatePriceRequest {
  serviceType: string;
  category: string;
  subcategory: string;
  answers: Record<string, any>;
  location?: string;
}

export interface TestExecutionRequest {
  testSuites?: Array<'database' | 'edge-functions' | 'storage' | 'templates'>;
  includeI18n?: boolean;
}

/**
 * Generate questions for a service type via AI
 */
export async function generateQuestions(request: GenerateQuestionsRequest) {
  const { data, error } = await supabase.functions.invoke('generate-questions', {
    body: request,
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Estimate price for a service via AI
 */
export async function estimatePrice(request: EstimatePriceRequest) {
  const { data, error } = await supabase.functions.invoke('estimate-price', {
    body: request,
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Execute comprehensive test suite
 */
export async function executeTests(request: TestExecutionRequest = {}) {
  const { data, error } = await supabase.functions.invoke('ai-test-orchestrator', {
    body: request,
  });

  if (error) throw new Error(error.message);
  return data;
}

export const aiTesting = {
  generateQuestions,
  estimatePrice,
  executeTests,
};
