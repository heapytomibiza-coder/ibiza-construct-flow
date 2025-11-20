import { z } from 'zod'

/**
 * Canonical job payload schema aligned to the jobs table
 * This is used for both step-level validation and final submission checks
 */
export const jobPayloadSchema = z.object({
  title: z.string().min(5, 'Job title must be at least 5 characters'),
  description: z
    .string()
    .min(10, 'Description should include a bit more detail')
    .optional(),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(2, 'Location is required'),
  location_type: z.enum(['in_person', 'online', 'both']),
  budget_type: z.enum(['fixed', 'hourly', 'negotiable']),
  budget_amount: z
    .number({ message: 'Budget must be a number' })
    .positive('Budget must be positive')
    .optional(),
  urgency: z.enum(['low', 'medium', 'high']),
  duration: z.string().optional(),
  skills: z.array(z.string()).optional(),
  metadata: z
    .object({
      photos: z.array(z.string()).optional(),
      notes: z.string().optional(),
    })
    .optional(),
  micro_uuid: z.string().uuid().optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export type JobPayload = z.infer<typeof jobPayloadSchema>
