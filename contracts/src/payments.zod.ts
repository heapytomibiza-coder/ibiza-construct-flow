/**
 * Payments API Contracts
 * Zod schemas for escrow operations
 */

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ContractSchema } from './contracts.zod';

extendZodWithOpenApi(z);

// Fund Escrow Response
export const FundEscrowResponseSchema = z.object({
  data: ContractSchema,
}).openapi('FundEscrowResponse');

// Release Escrow Response
export const ReleaseEscrowResponseSchema = z.object({
  data: ContractSchema,
}).openapi('ReleaseEscrowResponse');

// Refund Escrow Response
export const RefundEscrowResponseSchema = z.object({
  data: ContractSchema,
}).openapi('RefundEscrowResponse');

// Get Escrow Balance Response
export const GetEscrowBalanceResponseSchema = z.object({
  data: z.number(),
}).openapi('GetEscrowBalanceResponse');

// Get Pending Payments Response
export const GetPendingPaymentsResponseSchema = z.object({
  data: z.array(ContractSchema),
}).openapi('GetPendingPaymentsResponse');

// Export types
export type FundEscrowResponse = z.infer<typeof FundEscrowResponseSchema>;
export type ReleaseEscrowResponse = z.infer<typeof ReleaseEscrowResponseSchema>;
export type RefundEscrowResponse = z.infer<typeof RefundEscrowResponseSchema>;
export type GetEscrowBalanceResponse = z.infer<typeof GetEscrowBalanceResponseSchema>;
export type GetPendingPaymentsResponse = z.infer<typeof GetPendingPaymentsResponseSchema>;
