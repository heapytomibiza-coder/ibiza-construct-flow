/**
 * Contract generation: Re-export existing Zod schemas
 * This file imports your working Zod schemas and prepares them for OpenAPI generation
 */

import {
  QuestionOptionSchema,
  VisibilityCondSchema,
  VisibilityRuleSchema,
  QuestionDefSchema,
  MicroserviceDefSchema,
  PackSchema,
  QuestionMetricsSchema,
  PackPerformanceSchema,
} from '../../src/schemas/packs';

// Re-export for contract generation
export {
  QuestionOptionSchema,
  VisibilityCondSchema,
  VisibilityRuleSchema,
  QuestionDefSchema,
  MicroserviceDefSchema,
  PackSchema,
  QuestionMetricsSchema,
  PackPerformanceSchema,
};

// Additional schemas for API requests/responses
import { z } from 'zod';

export const PackFiltersSchema = z.object({
  status: z.enum(['draft', 'approved', 'retired']).optional(),
  source: z.enum(['manual', 'ai', 'hybrid']).optional(),
  slug: z.string().optional(),
  ibizaSpecific: z.boolean().optional(),
});

export const ImportPackPayloadSchema = z.object({
  slug: z.string().min(1),
  content: MicroserviceDefSchema,
  source: z.enum(['manual', 'ai', 'hybrid']),
  status: z.enum(['draft', 'approved']).optional(),
});

export const PackIdParamSchema = z.object({
  packId: z.string().uuid(),
});

export const SlugParamSchema = z.object({
  slug: z.string().min(1),
});

export const PackComparisonResponseSchema = z.object({
  active: PackSchema.nullable(),
  draft: PackSchema.nullable(),
  versionHistory: z.array(PackSchema),
  metrics: z.any().nullable(),
});
