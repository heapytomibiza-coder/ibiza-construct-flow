/**
 * Services API Contracts
 * Zod schemas for service micro management
 */

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// Question Schema
export const QuestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number', 'select', 'multi', 'file', 'date', 'boolean']),
  required: z.boolean(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(),
  showIf: z.object({
    questionId: z.string(),
    equals: z.union([z.string(), z.number(), z.boolean()]),
  }).optional(),
  priceImpact: z.number().optional(),
}).openapi('Question');

// Service Micro Schema
export const ServiceMicroSchema = z.object({
  id: z.string().uuid(),
  category: z.string(),
  subcategory: z.string(),
  micro: z.string(),
  questions_micro: z.array(QuestionSchema),
  questions_logistics: z.array(QuestionSchema),
}).openapi('ServiceMicro');

// Response Schemas
export const GetServiceMicrosResponseSchema = z.object({
  data: z.array(ServiceMicroSchema),
}).openapi('GetServiceMicrosResponse');

export const GetServiceMicroByIdResponseSchema = z.object({
  data: ServiceMicroSchema,
}).openapi('GetServiceMicroByIdResponse');

export const GetServicesByCategoryResponseSchema = z.object({
  data: z.array(ServiceMicroSchema),
}).openapi('GetServicesByCategoryResponse');

export const GetCategoriesResponseSchema = z.object({
  data: z.array(z.string()),
}).openapi('GetCategoriesResponse');

export const GetSubcategoriesResponseSchema = z.object({
  data: z.array(z.string()),
}).openapi('GetSubcategoriesResponse');

// Export types
export type Question = z.infer<typeof QuestionSchema>;
export type ServiceMicro = z.infer<typeof ServiceMicroSchema>;
export type GetServiceMicrosResponse = z.infer<typeof GetServiceMicrosResponseSchema>;
export type GetServiceMicroByIdResponse = z.infer<typeof GetServiceMicroByIdResponseSchema>;
export type GetServicesByCategoryResponse = z.infer<typeof GetServicesByCategoryResponseSchema>;
export type GetCategoriesResponse = z.infer<typeof GetCategoriesResponseSchema>;
export type GetSubcategoriesResponse = z.infer<typeof GetSubcategoriesResponseSchema>;
