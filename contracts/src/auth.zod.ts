/**
 * Auth API Contracts
 * Zod schemas for authentication operations
 */

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// User Session Schema
export const UserSessionSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  roles: z.array(z.enum(['client', 'professional', 'admin'])),
  verified: z.boolean(),
  activeRole: z.enum(['client', 'professional', 'admin']).nullable().optional(),
  profile: z.object({
    display_name: z.string().nullable().optional(),
    preferred_language: z.string().nullable().optional(),
    onboarding_status: z.string().nullable().optional(),
  }).optional(),
}).openapi('UserSession');

// Sign In Request/Response
export const SignInRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
}).openapi('SignInRequest');

export const SignInResponseSchema = z.object({
  data: UserSessionSchema,
}).openapi('SignInResponse');

// Sign Up Request/Response
export const SignUpRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
}).openapi('SignUpRequest');

export const SignUpResponseSchema = z.object({
  data: UserSessionSchema,
}).openapi('SignUpResponse');

// Get Session Response
export const GetSessionResponseSchema = z.object({
  data: UserSessionSchema.optional(),
}).openapi('GetSessionResponse');

// Sign Out Response
export const SignOutResponseSchema = z.object({
  success: z.boolean(),
}).openapi('SignOutResponse');

// Export types
export type UserSession = z.infer<typeof UserSessionSchema>;
export type SignInRequest = z.infer<typeof SignInRequestSchema>;
export type SignInResponse = z.infer<typeof SignInResponseSchema>;
export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;
export type SignUpResponse = z.infer<typeof SignUpResponseSchema>;
export type GetSessionResponse = z.infer<typeof GetSessionResponseSchema>;
export type SignOutResponse = z.infer<typeof SignOutResponseSchema>;
