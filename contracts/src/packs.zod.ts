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
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  ibizaSpecific: z.boolean().optional(),
});

export const ImportPackPayloadSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  content: MicroserviceDefSchema,
  source: z.enum(['manual', 'ai', 'hybrid']),
  status: z.enum(['draft', 'approved']).optional(),
}).superRefine((data, ctx) => {
  // Business rule: 4-12 questions typical, warn outside this range
  const qCount = data.content.questions.length;
  if (qCount < 4) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Only ${qCount} questions provided. Recommended minimum is 4 for meaningful discovery.`,
      path: ['content', 'questions'],
    });
  }
  if (qCount > 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${qCount} questions may overwhelm users. Recommended maximum is 12.`,
      path: ['content', 'questions'],
    });
  }
});

export const PackIdParamSchema = z.object({
  packId: z.string().uuid(),
});

export const SlugParamSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

export const PackComparisonResponseSchema = z.object({
  active: PackSchema.nullable(),
  draft: PackSchema.nullable(),
  versionHistory: z.array(PackSchema),
  metrics: z.any().nullable(),
});
