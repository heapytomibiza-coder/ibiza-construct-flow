/**
 * Input Validation Utilities
 * Security: Validates and sanitizes edge function inputs
 */

import { z, ZodSchema } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequestBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let body: any;
  
  try {
    body = await req.json();
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body');
  }

  const result = schema.safeParse(body);
  
  if (!result.success) {
    throw new ValidationError('Validation failed', {
      errors: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  return result.data;
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email().max(255),
  url: z.string().url().max(2000),
  nonEmptyString: z.string().trim().min(1).max(10000),
  positiveNumber: z.number().positive(),
  pagination: z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  }),
  dateRange: z.object({
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
  }),
};

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Validate and sanitize user input
 */
export function sanitizeUserInput(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeUserInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
