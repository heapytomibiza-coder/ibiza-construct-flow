import { z } from 'zod';

/**
 * Validation schemas for Post-a-Job wizard
 * Ensures data integrity and security before submission
 */

// Basic field validations
const titleSchema = z
  .string()
  .trim()
  .min(5, 'Title must be at least 5 characters')
  .max(200, 'Title must be less than 200 characters')
  .refine(val => !/[<>{}]/.test(val), 'Title contains invalid characters');

const descriptionSchema = z
  .string()
  .trim()
  .max(5000, 'Description must be less than 5000 characters')
  .optional();

const locationSchema = z
  .string()
  .trim()
  .max(500, 'Location must be less than 500 characters')
  .optional();

const urgencySchema = z.enum(['urgent', 'this_week', 'this_month', 'flexible']);

const budgetSchema = z
  .string()
  .trim()
  .max(100, 'Budget must be less than 100 characters')
  .optional();

const microSlugSchema = z
  .string()
  .trim()
  .min(1, 'Service selection is required')
  .regex(/^[a-z0-9-]+$/, 'Invalid service identifier');

const serviceIdSchema = z
  .string()
  .uuid('Invalid service ID format')
  .optional();

// Answer validation (recursive for nested objects)
const answerValueSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string().max(10000, 'Answer too long'),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(answerValueSchema),
    z.record(z.string(), answerValueSchema)
  ])
);

const answersSchema = z
  .record(z.string(), answerValueSchema)
  .optional();

// Requirements validation schema
const requirementsSchema = z.object({
  scope: z.string().trim().max(5000).optional(),
  timeline: z.string().trim().max(500).optional(),
  budgetRange: z.string().trim().max(100).optional(),
  constraints: z.string().trim().max(2000).optional(),
  materials: z.string().trim().max(2000).optional(),
  specifications: z.record(z.string(), answerValueSchema).optional(),
  referenceImages: z.array(z.object({
    name: z.string().max(255),
    url: z.string().url().max(1000)
  })).max(10).optional()
}).optional();

// Main wizard payload validation
export const wizardCompletePayloadSchema = z.object({
  // Core fields
  title: titleSchema,
  description: descriptionSchema,
  location: locationSchema,
  urgency: urgencySchema.optional(),
  
  // Critical identifiers
  serviceId: serviceIdSchema,
  microSlug: microSlugSchema,
  
  // Taxonomies (display only, sanitized)
  category: z.string().trim().max(100).optional(),
  subcategory: z.string().trim().max(100).optional(),
  micro: z.string().trim().max(100).optional(),
  
  // Project requirements (client describes needs)
  requirements: requirementsSchema,
  
  // Structured answers
  microAnswers: answersSchema,
  logisticsAnswers: answersSchema,
  generalAnswers: answersSchema
}).strict();

// Booking insert validation (what goes to DB)
export const bookingInsertSchema = z.object({
  client_id: z.string().uuid(),
  title: titleSchema,
  description: descriptionSchema,
  service_id: z.string().uuid().optional(),
  
  // Audit tracking
  micro_slug: microSlugSchema,
  catalogue_version_used: z.number().int().min(1).max(100),
  locale: z.string().regex(/^[a-z]{2}$/, 'Invalid locale format'),
  origin: z.enum(['web', 'mobile', 'api']),
  
  // Job details
  status: z.enum(['draft', 'posted', 'matched', 'in_progress', 'completed', 'cancelled']).optional(),
  preferred_dates: z.any().optional(),
  location_details: locationSchema,
  special_requirements: z.string().max(10000).optional(),
  budget_range: z.string().max(100).optional(),
  
  // Answers
  micro_q_answers: z.record(z.string(), answerValueSchema).optional(),
  general_answers: z.record(z.string(), answerValueSchema).optional()
}).strict();

/**
 * Validates and sanitizes wizard payload
 * @throws ZodError if validation fails
 */
export function validateWizardPayload(payload: unknown) {
  return wizardCompletePayloadSchema.parse(payload);
}

/**
 * Validates booking data before DB insert
 * @throws ZodError if validation fails
 */
export function validateBookingInsert(data: unknown) {
  return bookingInsertSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 */
export function safeValidateWizardPayload(payload: unknown) {
  return wizardCompletePayloadSchema.safeParse(payload);
}

export function safeValidateBookingInsert(data: unknown) {
  return bookingInsertSchema.safeParse(data);
}
