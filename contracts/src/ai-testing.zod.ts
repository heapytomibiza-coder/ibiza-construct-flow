/**
 * AI Testing Contracts
 * Zod schemas for AI question generation and price estimation testing
 */

import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-to-openapi';

extendZodWithOpenApi(z);

// Generate Questions Request/Response
export const GenerateQuestionsRequestSchema = z.object({
  serviceType: z.string().openapi({ example: 'Kitchen Sink Leak Repair' }),
  category: z.string().openapi({ example: 'Home Services' }),
  subcategory: z.string().openapi({ example: 'Plumbing' }),
}).openapi('GenerateQuestionsRequest');

export const GenerateQuestionsResponseSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'select', 'multi', 'file', 'date', 'boolean']),
    required: z.boolean(),
    options: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),
  })),
  metadata: z.object({
    serviceType: z.string(),
    category: z.string(),
    subcategory: z.string(),
  }).optional(),
}).openapi('GenerateQuestionsResponse');

// Price Estimation Request/Response
export const EstimatePriceRequestSchema = z.object({
  serviceType: z.string().openapi({ example: 'Kitchen Sink Leak Repair' }),
  category: z.string().openapi({ example: 'Home Services' }),
  subcategory: z.string().openapi({ example: 'Plumbing' }),
  answers: z.record(z.any()).openapi({ example: { leak_severity: 'moderate', access: 'easy' } }),
  location: z.string().optional().openapi({ example: 'Ibiza, Spain' }),
}).openapi('EstimatePriceRequest');

export const EstimatePriceResponseSchema = z.object({
  estimatedPrice: z.number(),
  currency: z.string().default('EUR'),
  breakdown: z.object({
    labor: z.number().optional(),
    materials: z.number().optional(),
    additional: z.number().optional(),
  }).optional(),
  confidence: z.number().min(0).max(1).optional(),
}).openapi('EstimatePriceResponse');

// Test Execution Request/Response
export const TestExecutionRequestSchema = z.object({
  testSuites: z.array(z.enum(['database', 'edge-functions', 'storage', 'templates'])).optional(),
  includeI18n: z.boolean().default(true),
}).openapi('TestExecutionRequest');

export const TestResultSchema = z.object({
  test: z.string(),
  status: z.enum(['pass', 'fail', 'pending']),
  message: z.string().optional(),
  duration: z.number().optional(),
}).openapi('TestResult');

export const TestExecutionResponseSchema = z.object({
  results: z.array(TestResultSchema),
  summary: z.object({
    passed: z.number(),
    failed: z.number(),
    total: z.number(),
    successRate: z.number(),
  }),
  logs: z.array(z.string()),
}).openapi('TestExecutionResponse');
