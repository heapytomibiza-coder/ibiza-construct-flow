/**
 * Professional Matching Contracts
 * Zod schemas for AI-powered professional matching and ranking
 */

import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-to-openapi';

extendZodWithOpenApi(z);

// Match Professionals Request/Response
export const MatchProfessionalsRequestSchema = z.object({
  jobRequirements: z.object({
    title: z.string().openapi({ example: 'Kitchen Renovation' }),
    description: z.string().openapi({ example: 'Complete kitchen remodel with new cabinets and countertops' }),
    skills: z.array(z.string()).optional().openapi({ example: ['carpentry', 'plumbing', 'electrical'] }),
  }),
  location: z.string().optional().openapi({ example: 'Ibiza, Spain' }),
  budget: z.number().optional().openapi({ example: 5000 }),
  urgency: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
}).openapi('MatchProfessionalsRequest');

export const ProfessionalMatchSchema = z.object({
  professionalId: z.string().openapi({ example: 'prof_123' }),
  name: z.string().openapi({ example: 'John Smith' }),
  matchScore: z.number().min(0).max(1).openapi({ example: 0.92 }),
  explanation: z.string().openapi({ example: 'Excellent match with 10+ years experience in kitchen renovations' }),
  strengths: z.array(z.string()).openapi({ example: ['Expert in cabinetry', 'Licensed electrician', 'Great reviews'] }),
  concerns: z.array(z.string()).openapi({ example: ['Slightly over budget'] }),
  rank: z.number().openapi({ example: 1 }),
}).openapi('ProfessionalMatch');

export const MatchProfessionalsResponseSchema = z.object({
  analysis: z.string().openapi({ example: 'Found 10 qualified professionals for this kitchen renovation project...' }),
  matches: z.array(ProfessionalMatchSchema),
  totalCandidates: z.number().openapi({ example: 25 }),
  averageMatchScore: z.number().openapi({ example: 0.78 }),
  timestamp: z.string().openapi({ example: '2025-01-15T10:30:00Z' }),
}).openapi('MatchProfessionalsResponse');

// Rank Matches Request/Response
export const RankMatchesRequestSchema = z.object({
  jobId: z.string().openapi({ example: 'job_123' }),
  professionalIds: z.array(z.string()).openapi({ example: ['prof_1', 'prof_2', 'prof_3'] }),
  criteria: z.object({
    skillsWeight: z.number().min(0).max(1).optional().default(0.4),
    ratingWeight: z.number().min(0).max(1).optional().default(0.3),
    availabilityWeight: z.number().min(0).max(1).optional().default(0.2),
    costWeight: z.number().min(0).max(1).optional().default(0.1),
  }).optional(),
}).openapi('RankMatchesRequest');

export const RankMatchesResponseSchema = z.object({
  rankedMatches: z.array(z.object({
    professionalId: z.string(),
    rank: z.number(),
    totalScore: z.number(),
    breakdown: z.object({
      skillsScore: z.number(),
      ratingScore: z.number(),
      availabilityScore: z.number(),
      costScore: z.number(),
    }),
  })),
}).openapi('RankMatchesResponse');

// Check Availability Request/Response
export const CheckAvailabilityRequestSchema = z.object({
  professionalId: z.string().openapi({ example: 'prof_123' }),
  startDate: z.string().openapi({ example: '2025-02-01' }),
  endDate: z.string().optional().openapi({ example: '2025-02-15' }),
  estimatedHours: z.number().optional().openapi({ example: 40 }),
}).openapi('CheckAvailabilityRequest');

export const CheckAvailabilityResponseSchema = z.object({
  professionalId: z.string(),
  available: z.boolean(),
  availableSlots: z.array(z.object({
    startDate: z.string(),
    endDate: z.string(),
    hoursAvailable: z.number(),
  })).optional(),
  conflictingBookings: z.array(z.object({
    jobId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  })).optional(),
  message: z.string().openapi({ example: 'Professional is available for the requested period' }),
}).openapi('CheckAvailabilityResponse');

// Submit Match Feedback Request/Response
export const SubmitMatchFeedbackRequestSchema = z.object({
  jobId: z.string().openapi({ example: 'job_123' }),
  professionalId: z.string().openapi({ example: 'prof_123' }),
  matchQuality: z.enum(['poor', 'fair', 'good', 'excellent']),
  feedback: z.string().optional().openapi({ example: 'Great match, very satisfied with the recommendation' }),
  wasHired: z.boolean().openapi({ example: true }),
}).openapi('SubmitMatchFeedbackRequest');

export const SubmitMatchFeedbackResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().openapi({ example: 'Feedback recorded successfully' }),
}).openapi('SubmitMatchFeedbackResponse');
