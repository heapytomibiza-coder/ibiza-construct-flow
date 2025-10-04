/**
 * Offers API Contracts
 * Zod schemas for offer management
 */

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// Offer Schema
export const OfferSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  taskerId: z.string().uuid(),
  message: z.string().optional(),
  amount: z.number().positive(),
  type: z.enum(['fixed', 'hourly']),
  status: z.enum(['sent', 'accepted', 'declined', 'withdrawn', 'expired']),
  createdAt: z.string().datetime(),
}).openapi('Offer');

// Send Offer Request/Response
export const SendOfferRequestSchema = z.object({
  jobId: z.string().uuid(),
  amount: z.number().positive(),
  type: z.enum(['fixed', 'hourly']),
  message: z.string().optional(),
}).openapi('SendOfferRequest');

export const SendOfferResponseSchema = z.object({
  data: OfferSchema,
}).openapi('SendOfferResponse');

// List Offers Response
export const ListOffersForJobResponseSchema = z.object({
  data: z.array(OfferSchema),
}).openapi('ListOffersForJobResponse');

// Accept Offer Response
export const AcceptOfferResponseSchema = z.object({
  data: OfferSchema,
}).openapi('AcceptOfferResponse');

// Decline Offer Response
export const DeclineOfferResponseSchema = z.object({
  data: OfferSchema,
}).openapi('DeclineOfferResponse');

// Get Offers By Tasker Response
export const GetOffersByTaskerResponseSchema = z.object({
  data: z.array(OfferSchema),
}).openapi('GetOffersByTaskerResponse');

// Export types
export type Offer = z.infer<typeof OfferSchema>;
export type SendOfferRequest = z.infer<typeof SendOfferRequestSchema>;
export type SendOfferResponse = z.infer<typeof SendOfferResponseSchema>;
export type ListOffersForJobResponse = z.infer<typeof ListOffersForJobResponseSchema>;
export type AcceptOfferResponse = z.infer<typeof AcceptOfferResponseSchema>;
export type DeclineOfferResponse = z.infer<typeof DeclineOfferResponseSchema>;
export type GetOffersByTaskerResponse = z.infer<typeof GetOffersByTaskerResponseSchema>;
