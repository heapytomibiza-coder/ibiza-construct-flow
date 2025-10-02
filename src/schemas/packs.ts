/**
 * Zod validation schemas for question packs
 * Used for parse-on-insert validation
 */

import { z } from 'zod';

export const QuestionOptionSchema = z.object({
  i18nKey: z.string().min(1),
  value: z.string().min(1),
  order: z.number().int().nonnegative(),
});

export const VisibilityCondSchema = z.object({
  questionKey: z.string(),
  equals: z.union([z.string(), z.number(), z.boolean()]),
});

export const VisibilityRuleSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    anyOf: z.array(VisibilityCondSchema).optional(),
    allOf: z.array(VisibilityCondSchema).optional(),
    not: VisibilityRuleSchema.optional(),
  })
);

export const QuestionDefSchema = z.object({
  key: z.string().regex(/^[a-z0-9_]+$/, 'Key must be lowercase letters, numbers, and underscores only'),
  type: z.enum(['single', 'multi', 'scale', 'text', 'number', 'yesno', 'file']),
  i18nKey: z.string().min(1),
  required: z.boolean().optional(),
  options: z.array(QuestionOptionSchema).optional().superRefine((opts, ctx) => {
    if (!opts) return;
    const seenValues = new Set<string>();
    const seenOrders = new Set<number>();
    opts.forEach((opt, idx) => {
      if (seenValues.has(opt.value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate option value: ${opt.value}`,
          path: [idx, 'value'],
        });
      }
      if (seenOrders.has(opt.order)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate option order: ${opt.order}`,
          path: [idx, 'order'],
        });
      }
      seenValues.add(opt.value);
      seenOrders.add(opt.order);
    });
  }),
  visibility: VisibilityRuleSchema.optional(),
  aiHint: z.string().optional(),
});

export const MicroserviceDefSchema = z.object({
  id: z.string().uuid(),
  category: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case (lowercase letters, numbers, and hyphens only)'),
  i18nPrefix: z.string().min(1),
  questions: z.array(QuestionDefSchema).min(1), // Flexible: business logic validates 4-12
});

export const PackSchema = z.object({
  pack_id: z.string().uuid(),
  micro_slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  version: z.number().int().positive(),
  status: z.enum(['draft', 'approved', 'retired']),
  source: z.enum(['manual', 'ai', 'hybrid']),
  prompt_hash: z.string().nullable().optional(),
  content: MicroserviceDefSchema,
  created_by: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime(),
  approved_at: z.string().datetime().nullable().optional(),
  approved_by: z.string().uuid().nullable().optional(),
  is_active: z.boolean(),
  ab_test_id: z.string().nullable().optional(),
});

export const QuestionMetricsSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  pack_id: z.string().uuid(),
  question_key: z.string().regex(/^[a-z0-9_]+$/),
  views: z.number().int().nonnegative(),
  answers: z.number().int().nonnegative(),
  dropoffs: z.number().int().nonnegative(),
  avg_time_ms: z.number().nonnegative(),
  updated_at: z.string().datetime(),
});

export const PackPerformanceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  pack_id: z.string().uuid(),
  completion_rate: z.number().min(0).max(1),
  median_duration_s: z.number().nonnegative(),
  created_at: z.string().datetime(),
});
