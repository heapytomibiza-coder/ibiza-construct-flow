import { z } from 'zod';

// User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable(),
  email: z.string().email().nullable(),
  roles: z.array(z.string()),
  active_role: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Get User Profile Request
export const GetUserProfileRequestSchema = z.object({
  userId: z.string().uuid(),
});

// Get User Profile Response
export const GetUserProfileResponseSchema = z.object({
  success: z.boolean(),
  data: UserProfileSchema.nullable(),
  error: z.string().optional(),
});

// List Users Request
export const ListUsersRequestSchema = z.object({
  limit: z.number().int().positive().optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
  role: z.string().optional(),
});

// List Users Response
export const ListUsersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserProfileSchema).nullable(),
  total: z.number().int().nonnegative(),
  error: z.string().optional(),
});

// User Activity Schema
export const UserActivitySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.string(),
  entity_type: z.string().nullable(),
  entity_id: z.string().uuid().nullable(),
  changes: z.record(z.string(), z.any()).nullable(),
  created_at: z.string().datetime(),
});

// Get User Activity Request
export const GetUserActivityRequestSchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().int().positive().optional().default(20),
});

// Get User Activity Response
export const GetUserActivityResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserActivitySchema).nullable(),
  error: z.string().optional(),
});

// User Job Summary Schema
export const UserJobSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.string(),
  created_at: z.string().datetime(),
});

// Get User Jobs Request
export const GetUserJobsRequestSchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().int().positive().optional().default(10),
});

// Get User Jobs Response
export const GetUserJobsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserJobSummarySchema).nullable(),
  error: z.string().optional(),
});

// Update User Status Request
export const UpdateUserStatusRequestSchema = z.object({
  userId: z.string().uuid(),
  roles: z.array(z.string()),
});

// Update User Status Response
export const UpdateUserStatusResponseSchema = z.object({
  success: z.boolean(),
  data: UserProfileSchema.nullable(),
  error: z.string().optional(),
});

// Export types
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type GetUserProfileRequest = z.infer<typeof GetUserProfileRequestSchema>;
export type GetUserProfileResponse = z.infer<typeof GetUserProfileResponseSchema>;
export type ListUsersRequest = z.infer<typeof ListUsersRequestSchema>;
export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;
export type UserActivity = z.infer<typeof UserActivitySchema>;
export type GetUserActivityRequest = z.infer<typeof GetUserActivityRequestSchema>;
export type GetUserActivityResponse = z.infer<typeof GetUserActivityResponseSchema>;
export type UserJobSummary = z.infer<typeof UserJobSummarySchema>;
export type GetUserJobsRequest = z.infer<typeof GetUserJobsRequestSchema>;
export type GetUserJobsResponse = z.infer<typeof GetUserJobsResponseSchema>;
export type UpdateUserStatusRequest = z.infer<typeof UpdateUserStatusRequestSchema>;
export type UpdateUserStatusResponse = z.infer<typeof UpdateUserStatusResponseSchema>;
