/**
 * Escrow Operations API Contracts
 * Zod schemas for fund, release, refund operations
 */

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// ========== Fund Escrow ==========

export const FundEscrowRequestSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3-letter code').default('EUR'),
  paymentMethodId: z.string().optional(),
}).openapi('FundEscrowRequest');

export const FundEscrowResponseSchema = z.object({
  success: z.boolean(),
  escrowId: z.string().uuid(),
  holdingAccountId: z.string().uuid(),
  stripePaymentIntentId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['held', 'pending']),
}).openapi('FundEscrowResponse');

// ========== Release Escrow ==========

export const ReleaseEscrowRequestSchema = z.object({
  milestoneId: z.string().uuid('Invalid milestone ID'),
  notes: z.string().optional(),
  review: z.object({
    rating: z.number().min(1).max(5),
    title: z.string().optional(),
    comment: z.string().optional(),
  }).optional(),
  override: z.boolean().optional(), // Admin force-release
}).openapi('ReleaseEscrowRequest');

export const ReleaseEscrowResponseSchema = z.object({
  success: z.boolean(),
  releaseId: z.string().uuid(),
  stripeTransferId: z.string(),
  amount: z.number(),
  platformFee: z.number(),
  netAmount: z.number(),
  status: z.enum(['released', 'processing']),
}).openapi('ReleaseEscrowResponse');

// ========== Refund Escrow ==========

export const RefundEscrowRequestSchema = z.object({
  milestoneId: z.string().uuid('Invalid milestone ID'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  amount: z.number().positive().optional(), // Partial refund
}).openapi('RefundEscrowRequest');

export const RefundEscrowResponseSchema = z.object({
  success: z.boolean(),
  refundId: z.string().uuid(),
  stripeRefundId: z.string(),
  amount: z.number(),
  status: z.enum(['refunded', 'processing']),
}).openapi('RefundEscrowResponse');

// ========== Get Balance ==========

export const GetEscrowBalanceRequestSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
}).openapi('GetEscrowBalanceRequest');

export const GetEscrowBalanceResponseSchema = z.object({
  balance: z.number(),
  held: z.number(),
  released: z.number(),
  refunded: z.number(),
  pending: z.number(),
}).openapi('GetEscrowBalanceResponse');

// Export types
export type FundEscrowRequest = z.infer<typeof FundEscrowRequestSchema>;
export type FundEscrowResponse = z.infer<typeof FundEscrowResponseSchema>;
export type ReleaseEscrowRequest = z.infer<typeof ReleaseEscrowRequestSchema>;
export type ReleaseEscrowResponse = z.infer<typeof ReleaseEscrowResponseSchema>;
export type RefundEscrowRequest = z.infer<typeof RefundEscrowRequestSchema>;
export type RefundEscrowResponse = z.infer<typeof RefundEscrowResponseSchema>;
export type GetEscrowBalanceRequest = z.infer<typeof GetEscrowBalanceRequestSchema>;
export type GetEscrowBalanceResponse = z.infer<typeof GetEscrowBalanceResponseSchema>;
