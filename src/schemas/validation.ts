/**
 * Validation schemas using Zod
 * Centralized validation for forms, API requests, and data structures
 */
import { z } from 'zod';

// ============================================================================
// USER & AUTHENTICATION SCHEMAS
// ============================================================================

export const emailSchema = z.string().email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['client', 'professional', 'admin']),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const profileUpdateSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number').optional(),
  location: z.string().max(100).optional(),
  avatarUrl: z.string().url('Please enter a valid URL').optional()
});

// ============================================================================
// JOB POSTING SCHEMAS
// ============================================================================

export const locationSchema = z.object({
  address: z.string().min(5, 'Please enter a valid location'),
  customLocation: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
});

export const logisticsSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  customLocation: z.string().optional(),
  startDate: z.date().optional(),
  startDatePreset: z.string().optional(),
  completionDate: z.date().optional(),
  consultationType: z.enum(['site_visit', 'phone_call', 'video_call']),
  consultationDate: z.date().optional(),
  consultationTime: z.string().optional(),
  accessDetails: z.array(z.string()).optional(),
  budgetRange: z.string().min(1, 'Budget range is required')
}).refine(
  data => data.startDate || data.startDatePreset,
  { message: 'Please select a start date or preset', path: ['startDate'] }
);

export const jobExtrasSchema = z.object({
  photos: z.array(z.string().url()).max(10, 'Maximum 10 photos allowed'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  permitsConcern: z.boolean().optional()
});

export const jobPostSchema = z.object({
  microId: z.string().uuid('Invalid service ID'),
  microName: z.string().min(1, 'Service name is required'),
  mainCategory: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  answers: z.record(z.any()),
  logistics: logisticsSchema,
  extras: jobExtrasSchema
});

// ============================================================================
// BOOKING SCHEMAS
// ============================================================================

export const bookingFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: z.string()
    .min(9, 'Phone number must be at least 9 digits')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Please enter a valid phone number'),
  preferredDate: z.date({ required_error: 'Date is required' }),
  preferredTime: z.string().min(1, 'Please select a time'),
  service: z.string().min(1, 'Please select a service'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must be less than 500 characters')
    .optional()
});

// ============================================================================
// MESSAGING SCHEMAS
// ============================================================================

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
  recipientId: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
  attachments: z.array(z.string().url()).max(5).optional(),
  metadata: z.record(z.any()).optional()
});

export const conversationSchema = z.object({
  participantIds: z.array(z.string().uuid()).min(2, 'At least 2 participants required'),
  jobId: z.string().uuid().optional(),
  subject: z.string().max(200).optional()
});

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const paymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['EUR', 'USD', 'GBP']).default('EUR'),
  jobId: z.string().uuid(),
  description: z.string().max(500).optional()
});

export const milestoneSchema = z.object({
  jobId: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.date({ required_error: 'Date is required' }).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'released']).default('pending')
});

// ============================================================================
// REVIEW SCHEMAS
// ============================================================================

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must be less than 1000 characters'),
  jobId: z.string().uuid(),
  professionalId: z.string().uuid(),
  categories: z.object({
    quality: z.number().min(1).max(5).optional(),
    communication: z.number().min(1).max(5).optional(),
    timeliness: z.number().min(1).max(5).optional(),
    professionalism: z.number().min(1).max(5).optional()
  }).optional()
});

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File must be less than 10MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type),
      'File must be an image (JPEG, PNG, WebP) or PDF'
    ),
  bucket: z.enum(['avatars', 'job-photos', 'documents', 'messages']),
  path: z.string().optional()
});

// ============================================================================
// OFFER & NEGOTIATION SCHEMAS
// ============================================================================

export const offerSchema = z.object({
  jobId: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['EUR', 'USD', 'GBP']).default('EUR'),
  estimatedDuration: z.number().positive('Duration must be positive').optional(),
  durationUnit: z.enum(['hours', 'days', 'weeks']).optional(),
  message: z.string().max(1000).optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms')
});

export const counterOfferSchema = z.object({
  offerId: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  message: z.string().max(500).optional()
});

// ============================================================================
// SEARCH & FILTER SCHEMAS
// ============================================================================

export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  location: z.string().optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
  rating: z.number().min(0).max(5).optional(),
  availability: z.enum(['immediate', 'this_week', 'this_month', 'flexible']).optional(),
  sortBy: z.enum(['relevance', 'price_low', 'price_high', 'rating', 'distance']).optional()
});

// ============================================================================
// TYPE INFERENCE HELPERS
// ============================================================================

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type JobPostData = z.infer<typeof jobPostSchema>;
export type LogisticsData = z.infer<typeof logisticsSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;
export type MessageData = z.infer<typeof messageSchema>;
export type PaymentIntentData = z.infer<typeof paymentIntentSchema>;
export type MilestoneData = z.infer<typeof milestoneSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;
export type OfferData = z.infer<typeof offerSchema>;
export type CounterOfferData = z.infer<typeof counterOfferSchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Safe validation that returns result object instead of throwing
 */
export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }
  
  const errors = result.error.issues.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
  
  return { success: false, data: null, errors };
};

/**
 * Get first error message from validation result
 */
export const getFirstError = (errors: { path: string; message: string }[] | null): string | null => {
  return errors && errors.length > 0 ? errors[0].message : null;
};

/**
 * Format validation errors for form display
 */
export const formatValidationErrors = (
  errors: { path: string; message: string }[] | null
): Record<string, string> => {
  if (!errors) return {};
  
  return errors.reduce((acc, err) => {
    acc[err.path] = err.message;
    return acc;
  }, {} as Record<string, string>);
};
