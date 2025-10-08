import { z } from 'zod';

/**
 * Admin CMS Type Definitions & Validation Schemas
 * Phase 2: TypeScript Contracts
 */

// Question option for select-type questions
export const QuestionOption = z.object({ 
  value: z.string().min(1, "Option value is required"), 
  label: z.string().min(1, "Option label is required")
});

// Supported question types
export const QuestionType = z.enum([
  'short_text',
  'long_text',
  'number',
  'boolean',
  'single_select',
  'multi_select',
  'date',
  'file'
]);

// Individual question schema
export const Question = z.object({
  code: z.string()
    .min(2, "Question code must be at least 2 characters")
    .regex(/^[a-z0-9_]+$/, "Question code must be lowercase letters, numbers, and underscores only"),
  label: z.string().min(2, "Question label must be at least 2 characters"),
  help_text: z.string().optional(),
  type: QuestionType,
  required: z.boolean().optional().default(false),
  options: z.array(QuestionOption).optional(),
  validation: z.record(z.string(), z.any()).optional(),
  sort_index: z.number().int().nonnegative().default(0),
});

// Service micro row schema (for CRUD operations)
export const ServiceMicroRow = z.object({
  id: z.string().uuid().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  micro: z.string().min(1, "Micro service name is required"),
  questions_micro: z.array(Question).default([]),
  questions_logistics: z.array(Question).default([]),
  is_active: z.boolean().default(true),
  sort_index: z.number().int().default(0),
  change_summary: z.string().optional(),
});

// Profile verification action schema
export const ProfileVerificationAction = z.object({
  profile_id: z.string().uuid("Invalid profile ID"),
  action: z.enum(['approve', 'reject', 'under_review']),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  reason: z.string().max(500, "Reason must be less than 500 characters").optional(),
});

// Export TypeScript types
export type QuestionOption = z.infer<typeof QuestionOption>;
export type QuestionType = z.infer<typeof QuestionType>;
export type Question = z.infer<typeof Question>;
export type ServiceMicroRow = z.infer<typeof ServiceMicroRow>;
export type ProfileVerificationAction = z.infer<typeof ProfileVerificationAction>;
