/**
 * Shared types for contract-generated clients
 * These types are used across all generated React Query hooks
 */

// Re-export all Zod schema types
export type {
  // Question Packs
  Pack,
  MicroserviceDef,
  QuestionDef,
  PackMetadata,
  CreatePackRequest,
  CreatePackResponse,
  UpdatePackRequest,
  ApprovePackRequest,
  GetPackResponse,
  ListPacksResponse,
  ImportPackRequest,
  GetComparisonResponse,
  GetPackMetricsResponse,
} from '../../../contracts/src/packs.zod';

export type {
  // AI Testing
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  EstimatePriceRequest,
  EstimatePriceResponse,
  ExecuteTestSuiteRequest,
  ExecuteTestSuiteResponse,
} from '../../../contracts/src/ai-testing.zod';

export type {
  // Professional Matching
  MatchProfessionalsRequest,
  MatchProfessionalsResponse,
  RankProfessionalsRequest,
  RankProfessionalsResponse,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse,
  SubmitFeedbackRequest,
  SubmitFeedbackResponse,
} from '../../../contracts/src/professional-matching.zod';

export type {
  // Discovery Analytics
  TrackEventRequest,
  TrackEventResponse,
  GetMetricsRequest,
  GetMetricsResponse,
  GetConversionFunnelRequest,
  GetConversionFunnelResponse,
  GetABTestResultsRequest,
  GetABTestResultsResponse,
  GetTopSearchesRequest,
  GetTopSearchesResponse,
} from '../../../contracts/src/discovery-analytics.zod';

export type {
  // User Inspector
  UserProfile,
  GetUserProfileRequest,
  GetUserProfileResponse,
  ListUsersRequest,
  ListUsersResponse,
  UserActivity,
  GetUserActivityRequest,
  GetUserActivityResponse,
  UserJobSummary,
  GetUserJobsRequest,
  GetUserJobsResponse,
  UpdateUserStatusRequest,
  UpdateUserStatusResponse,
} from '../../../contracts/src/user-inspector.zod';

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
