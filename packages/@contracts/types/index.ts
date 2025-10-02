/**
 * Shared types for contract-generated clients
 * These types are inferred from Zod schemas for type safety
 */

import { z } from 'zod';

// ==================== Question Packs ====================
import {
  PackSchema,
  MicroserviceDefSchema,
  QuestionDefSchema,
  PackFiltersSchema,
  ImportPackPayloadSchema,
  PackComparisonResponseSchema,
} from '../../../contracts/src/packs.zod';

export type Pack = z.infer<typeof PackSchema>;
export type MicroserviceDef = z.infer<typeof MicroserviceDefSchema>;
export type QuestionDef = z.infer<typeof QuestionDefSchema>;
export type PackFilters = z.infer<typeof PackFiltersSchema>;
export type ImportPackPayload = z.infer<typeof ImportPackPayloadSchema>;
export type PackComparison = z.infer<typeof PackComparisonResponseSchema>;

// ==================== AI Testing ====================
import {
  GenerateQuestionsRequestSchema,
  GenerateQuestionsResponseSchema,
  EstimatePriceRequestSchema,
  EstimatePriceResponseSchema,
  TestExecutionRequestSchema,
  TestExecutionResponseSchema,
} from '../../../contracts/src/ai-testing.zod';

export type GenerateQuestionsRequest = z.infer<typeof GenerateQuestionsRequestSchema>;
export type GenerateQuestionsResponse = z.infer<typeof GenerateQuestionsResponseSchema>;
export type EstimatePriceRequest = z.infer<typeof EstimatePriceRequestSchema>;
export type EstimatePriceResponse = z.infer<typeof EstimatePriceResponseSchema>;
export type TestExecutionRequest = z.infer<typeof TestExecutionRequestSchema>;
export type TestExecutionResponse = z.infer<typeof TestExecutionResponseSchema>;

// ==================== Professional Matching ====================
import {
  MatchProfessionalsRequestSchema,
  MatchProfessionalsResponseSchema,
  ProfessionalMatchSchema,
  RankMatchesRequestSchema,
  RankMatchesResponseSchema,
  CheckAvailabilityRequestSchema,
  CheckAvailabilityResponseSchema,
  SubmitMatchFeedbackRequestSchema,
  SubmitMatchFeedbackResponseSchema,
} from '../../../contracts/src/professional-matching.zod';

export type MatchProfessionalsRequest = z.infer<typeof MatchProfessionalsRequestSchema>;
export type MatchProfessionalsResponse = z.infer<typeof MatchProfessionalsResponseSchema>;
export type ProfessionalMatch = z.infer<typeof ProfessionalMatchSchema>;
export type RankMatchesRequest = z.infer<typeof RankMatchesRequestSchema>;
export type RankMatchesResponse = z.infer<typeof RankMatchesResponseSchema>;
export type CheckAvailabilityRequest = z.infer<typeof CheckAvailabilityRequestSchema>;
export type CheckAvailabilityResponse = z.infer<typeof CheckAvailabilityResponseSchema>;
export type SubmitMatchFeedbackRequest = z.infer<typeof SubmitMatchFeedbackRequestSchema>;
export type SubmitMatchFeedbackResponse = z.infer<typeof SubmitMatchFeedbackResponseSchema>;

// ==================== Discovery Analytics ====================
import {
  TrackEventRequestSchema,
  TrackEventResponseSchema,
  GetMetricsRequestSchema,
  GetMetricsResponseSchema,
  MetricDataPointSchema,
  GetConversionFunnelRequestSchema,
  GetConversionFunnelResponseSchema,
  FunnelStepSchema,
  GetABTestResultsRequestSchema,
  GetABTestResultsResponseSchema,
  ABTestVariantSchema,
  GetTopSearchesRequestSchema,
  GetTopSearchesResponseSchema,
  SearchQueryDataSchema,
} from '../../../contracts/src/discovery-analytics.zod';

export type TrackEventRequest = z.infer<typeof TrackEventRequestSchema>;
export type TrackEventResponse = z.infer<typeof TrackEventResponseSchema>;
export type GetMetricsRequest = z.infer<typeof GetMetricsRequestSchema>;
export type GetMetricsResponse = z.infer<typeof GetMetricsResponseSchema>;
export type MetricDataPoint = z.infer<typeof MetricDataPointSchema>;
export type GetConversionFunnelRequest = z.infer<typeof GetConversionFunnelRequestSchema>;
export type GetConversionFunnelResponse = z.infer<typeof GetConversionFunnelResponseSchema>;
export type FunnelStep = z.infer<typeof FunnelStepSchema>;
export type GetABTestResultsRequest = z.infer<typeof GetABTestResultsRequestSchema>;
export type GetABTestResultsResponse = z.infer<typeof GetABTestResultsResponseSchema>;
export type ABTestVariant = z.infer<typeof ABTestVariantSchema>;
export type GetTopSearchesRequest = z.infer<typeof GetTopSearchesRequestSchema>;
export type GetTopSearchesResponse = z.infer<typeof GetTopSearchesResponseSchema>;
export type SearchQueryData = z.infer<typeof SearchQueryDataSchema>;

// ==================== User Inspector ====================
import {
  ListUsersRequestSchema,
  ListUsersResponseSchema,
  GetUserProfileRequestSchema,
  GetUserProfileResponseSchema,
  GetUserActivityRequestSchema,
  GetUserActivityResponseSchema,
  GetUserJobsRequestSchema,
  GetUserJobsResponseSchema,
  UpdateUserStatusRequestSchema,
  UpdateUserStatusResponseSchema,
} from '../../../contracts/src/user-inspector.zod';

export type ListUsersRequest = z.infer<typeof ListUsersRequestSchema>;
export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;
export type GetUserProfileRequest = z.infer<typeof GetUserProfileRequestSchema>;
export type GetUserProfileResponse = z.infer<typeof GetUserProfileResponseSchema>;
export type GetUserActivityRequest = z.infer<typeof GetUserActivityRequestSchema>;
export type GetUserActivityResponse = z.infer<typeof GetUserActivityResponseSchema>;
export type GetUserJobsRequest = z.infer<typeof GetUserJobsRequestSchema>;
export type GetUserJobsResponse = z.infer<typeof GetUserJobsResponseSchema>;
export type UpdateUserStatusRequest = z.infer<typeof UpdateUserStatusRequestSchema>;
export type UpdateUserStatusResponse = z.infer<typeof UpdateUserStatusResponseSchema>;

/**
 * Common API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * React Query hook options
 */
export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number | false;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: boolean | number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * React Query mutation options
 */
export interface MutationOptions {
  onMutate?: (variables: any) => Promise<any> | any;
  onSuccess?: (data: any, variables: any, context: any) => Promise<void> | void;
  onError?: (error: Error, variables: any, context: any) => Promise<void> | void;
  onSettled?: (data: any, error: Error | null, variables: any, context: any) => Promise<void> | void;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

/**
 * Sort params
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter params
 */
export interface FilterParams {
  search?: string;
  status?: string;
  type?: string;
  [key: string]: any;
}

/**
 * Common list response
 */
export interface ListResponse<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}
