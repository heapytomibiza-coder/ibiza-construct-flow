/**
 * Contracts API Contracts
 * Zod schemas for contract lifecycle management
 */

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// Contract Schema
export const ContractSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  taskerId: z.string().uuid(),
  clientId: z.string().uuid(),
  type: z.enum(['fixed', 'hourly']),
  agreedAmount: z.number().positive(),
  escrowStatus: z.enum(['none', 'funded', 'released', 'refunded']),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
}).openapi('Contract');

// Create From Offer Request/Response
export const CreateFromOfferRequestSchema = z.object({
  offerId: z.string().uuid(),
}).openapi('CreateFromOfferRequest');

export const CreateFromOfferResponseSchema = z.object({
  data: ContractSchema,
}).openapi('CreateFromOfferResponse');

// Get Contract Response
export const GetContractResponseSchema = z.object({
  data: ContractSchema,
}).openapi('GetContractResponse');

// Get Contracts By User Response
export const GetContractsByUserResponseSchema = z.object({
  data: z.array(ContractSchema),
}).openapi('GetContractsByUserResponse');

// Mark In Progress Response
export const MarkInProgressResponseSchema = z.object({
  data: ContractSchema,
}).openapi('MarkInProgressResponse');

// Submit Completion Response
export const SubmitCompletionResponseSchema = z.object({
  data: ContractSchema,
}).openapi('SubmitCompletionResponse');

// Export types
export type Contract = z.infer<typeof ContractSchema>;
export type CreateFromOfferRequest = z.infer<typeof CreateFromOfferRequestSchema>;
export type CreateFromOfferResponse = z.infer<typeof CreateFromOfferResponseSchema>;
export type GetContractResponse = z.infer<typeof GetContractResponseSchema>;
export type GetContractsByUserResponse = z.infer<typeof GetContractsByUserResponseSchema>;
export type MarkInProgressResponse = z.infer<typeof MarkInProgressResponseSchema>;
export type SubmitCompletionResponse = z.infer<typeof SubmitCompletionResponseSchema>;
