/**
 * OpenAPI Specification Generator
 * Generates openapi.yaml from existing Zod schemas
 * Run: ts-node contracts/src/index.ts > contracts/openapi.yaml
 */

import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@anatine/zod-to-openapi';
import { z } from 'zod';
import {
  PackSchema,
  PackFiltersSchema,
  ImportPackPayloadSchema,
  PackIdParamSchema,
  SlugParamSchema,
  PackComparisonResponseSchema,
  QuestionMetricsSchema,
} from './packs.zod';
import {
  GenerateQuestionsRequestSchema,
  GenerateQuestionsResponseSchema,
  EstimatePriceRequestSchema,
  EstimatePriceResponseSchema,
  TestExecutionRequestSchema,
  TestExecutionResponseSchema,
} from './ai-testing.zod';
import {
  MatchProfessionalsRequestSchema,
  MatchProfessionalsResponseSchema,
  RankMatchesRequestSchema,
  RankMatchesResponseSchema,
  CheckAvailabilityRequestSchema,
  CheckAvailabilityResponseSchema,
  SubmitMatchFeedbackRequestSchema,
  SubmitMatchFeedbackResponseSchema,
} from './professional-matching.zod';
import {
  TrackEventRequestSchema,
  TrackEventResponseSchema,
  GetMetricsRequestSchema,
  GetMetricsResponseSchema,
  GetConversionFunnelRequestSchema,
  GetConversionFunnelResponseSchema,
  GetABTestResultsRequestSchema,
  GetABTestResultsResponseSchema,
  GetTopSearchesRequestSchema,
  GetTopSearchesResponseSchema,
} from './discovery-analytics.zod';
import {
  UserProfileSchema,
  GetUserProfileRequestSchema,
  GetUserProfileResponseSchema,
  ListUsersRequestSchema,
  ListUsersResponseSchema,
  GetUserActivityRequestSchema,
  GetUserActivityResponseSchema,
  GetUserJobsRequestSchema,
  GetUserJobsResponseSchema,
  UpdateUserStatusRequestSchema,
  UpdateUserStatusResponseSchema,
} from './user-inspector.zod';
import {
  DraftJobSchema,
  JobSchema,
  SaveDraftRequestSchema,
  SaveDraftResponseSchema,
  PublishJobRequestSchema,
  PublishJobResponseSchema,
  GetJobResponseSchema,
  GetJobsByClientResponseSchema,
  GetOpenJobsResponseSchema,
} from './jobs.zod';
import {
  ServiceMicroSchema,
  GetServiceMicrosResponseSchema,
  GetServiceMicroByIdResponseSchema,
  GetServicesByCategoryResponseSchema,
  GetCategoriesResponseSchema,
  GetSubcategoriesResponseSchema,
} from './services.zod';
import {
  OfferSchema,
  SendOfferRequestSchema,
  SendOfferResponseSchema,
  ListOffersForJobResponseSchema,
  AcceptOfferResponseSchema,
  DeclineOfferResponseSchema,
  GetOffersByTaskerResponseSchema,
} from './offers.zod';
import {
  ContractSchema,
  CreateFromOfferRequestSchema,
  CreateFromOfferResponseSchema,
  GetContractResponseSchema,
  GetContractsByUserResponseSchema,
  MarkInProgressResponseSchema,
  SubmitCompletionResponseSchema,
} from './contracts.zod';
import {
  FundEscrowResponseSchema,
  ReleaseEscrowResponseSchema,
  RefundEscrowResponseSchema,
  GetEscrowBalanceResponseSchema,
  GetPendingPaymentsResponseSchema,
} from './payments.zod';
import {
  UserSessionSchema,
  SignInRequestSchema,
  SignInResponseSchema,
  SignUpRequestSchema,
  SignUpResponseSchema,
  GetSessionResponseSchema,
  SignOutResponseSchema,
} from './auth.zod';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Create registry
const registry = new OpenAPIRegistry();

// Register schemas
registry.register('Pack', PackSchema);
registry.register('PackFilters', PackFiltersSchema);
registry.register('ImportPackPayload', ImportPackPayloadSchema);
registry.register('PackComparison', PackComparisonResponseSchema);
registry.register('QuestionMetrics', QuestionMetricsSchema);
registry.register('GenerateQuestionsRequest', GenerateQuestionsRequestSchema);
registry.register('GenerateQuestionsResponse', GenerateQuestionsResponseSchema);
registry.register('EstimatePriceRequest', EstimatePriceRequestSchema);
registry.register('EstimatePriceResponse', EstimatePriceResponseSchema);
registry.register('TestExecutionRequest', TestExecutionRequestSchema);
registry.register('TestExecutionResponse', TestExecutionResponseSchema);
registry.register('MatchProfessionalsRequest', MatchProfessionalsRequestSchema);
registry.register('MatchProfessionalsResponse', MatchProfessionalsResponseSchema);
registry.register('RankMatchesRequest', RankMatchesRequestSchema);
registry.register('RankMatchesResponse', RankMatchesResponseSchema);
registry.register('CheckAvailabilityRequest', CheckAvailabilityRequestSchema);
registry.register('CheckAvailabilityResponse', CheckAvailabilityResponseSchema);
registry.register('SubmitMatchFeedbackRequest', SubmitMatchFeedbackRequestSchema);
registry.register('SubmitMatchFeedbackResponse', SubmitMatchFeedbackResponseSchema);
registry.register('TrackEventRequest', TrackEventRequestSchema);
registry.register('TrackEventResponse', TrackEventResponseSchema);
registry.register('GetMetricsRequest', GetMetricsRequestSchema);
registry.register('GetMetricsResponse', GetMetricsResponseSchema);
registry.register('GetConversionFunnelRequest', GetConversionFunnelRequestSchema);
registry.register('GetConversionFunnelResponse', GetConversionFunnelResponseSchema);
registry.register('GetABTestResultsRequest', GetABTestResultsRequestSchema);
registry.register('GetABTestResultsResponse', GetABTestResultsResponseSchema);
registry.register('GetTopSearchesRequest', GetTopSearchesRequestSchema);
registry.register('GetTopSearchesResponse', GetTopSearchesResponseSchema);
registry.register('UserProfile', UserProfileSchema);
registry.register('GetUserProfileRequest', GetUserProfileRequestSchema);
registry.register('GetUserProfileResponse', GetUserProfileResponseSchema);
registry.register('ListUsersRequest', ListUsersRequestSchema);
registry.register('ListUsersResponse', ListUsersResponseSchema);
registry.register('GetUserActivityRequest', GetUserActivityRequestSchema);
registry.register('GetUserActivityResponse', GetUserActivityResponseSchema);
registry.register('GetUserJobsRequest', GetUserJobsRequestSchema);
registry.register('GetUserJobsResponse', GetUserJobsResponseSchema);
registry.register('UpdateUserStatusRequest', UpdateUserStatusRequestSchema);
registry.register('UpdateUserStatusResponse', UpdateUserStatusResponseSchema);
registry.register('DraftJob', DraftJobSchema);
registry.register('Job', JobSchema);
registry.register('SaveDraftRequest', SaveDraftRequestSchema);
registry.register('SaveDraftResponse', SaveDraftResponseSchema);
registry.register('PublishJobRequest', PublishJobRequestSchema);
registry.register('PublishJobResponse', PublishJobResponseSchema);
registry.register('GetJobResponse', GetJobResponseSchema);
registry.register('GetJobsByClientResponse', GetJobsByClientResponseSchema);
registry.register('GetOpenJobsResponse', GetOpenJobsResponseSchema);
registry.register('ServiceMicro', ServiceMicroSchema);
registry.register('GetServiceMicrosResponse', GetServiceMicrosResponseSchema);
registry.register('GetServiceMicroByIdResponse', GetServiceMicroByIdResponseSchema);
registry.register('GetServicesByCategoryResponse', GetServicesByCategoryResponseSchema);
registry.register('GetCategoriesResponse', GetCategoriesResponseSchema);
registry.register('GetSubcategoriesResponse', GetSubcategoriesResponseSchema);
registry.register('Offer', OfferSchema);
registry.register('SendOfferRequest', SendOfferRequestSchema);
registry.register('SendOfferResponse', SendOfferResponseSchema);
registry.register('ListOffersForJobResponse', ListOffersForJobResponseSchema);
registry.register('AcceptOfferResponse', AcceptOfferResponseSchema);
registry.register('DeclineOfferResponse', DeclineOfferResponseSchema);
registry.register('GetOffersByTaskerResponse', GetOffersByTaskerResponseSchema);
registry.register('Contract', ContractSchema);
registry.register('CreateFromOfferRequest', CreateFromOfferRequestSchema);
registry.register('CreateFromOfferResponse', CreateFromOfferResponseSchema);
registry.register('GetContractResponse', GetContractResponseSchema);
registry.register('GetContractsByUserResponse', GetContractsByUserResponseSchema);
registry.register('MarkInProgressResponse', MarkInProgressResponseSchema);
registry.register('SubmitCompletionResponse', SubmitCompletionResponseSchema);
registry.register('FundEscrowResponse', FundEscrowResponseSchema);
registry.register('ReleaseEscrowResponse', ReleaseEscrowResponseSchema);
registry.register('RefundEscrowResponse', RefundEscrowResponseSchema);
registry.register('GetEscrowBalanceResponse', GetEscrowBalanceResponseSchema);
registry.register('GetPendingPaymentsResponse', GetPendingPaymentsResponseSchema);
registry.register('UserSession', UserSessionSchema);
registry.register('SignInRequest', SignInRequestSchema);
registry.register('SignInResponse', SignInResponseSchema);
registry.register('SignUpRequest', SignUpRequestSchema);
registry.register('SignUpResponse', SignUpResponseSchema);
registry.register('GetSessionResponse', GetSessionResponseSchema);
registry.register('SignOutResponse', SignOutResponseSchema);

// Register paths
registry.registerPath({
  method: 'get',
  path: '/admin/packs',
  summary: 'List question packs',
  tags: ['Packs'],
  request: {
    query: PackFiltersSchema,
  },
  responses: {
    200: {
      description: 'List of question packs',
      content: {
        'application/json': {
          schema: z.array(PackSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/packs/import',
  summary: 'Import a new question pack',
  tags: ['Packs'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ImportPackPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Imported pack',
      content: {
        'application/json': {
          schema: PackSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/packs/{packId}/approve',
  summary: 'Approve a draft pack',
  tags: ['Packs'],
  request: {
    params: PackIdParamSchema,
  },
  responses: {
    200: {
      description: 'Approved pack',
      content: {
        'application/json': {
          schema: PackSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/packs/{packId}/activate',
  summary: 'Activate an approved pack',
  tags: ['Packs'],
  request: {
    params: PackIdParamSchema,
  },
  responses: {
    200: {
      description: 'Activated pack',
      content: {
        'application/json': {
          schema: PackSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/packs/{packId}/retire',
  summary: 'Retire a pack',
  tags: ['Packs'],
  request: {
    params: PackIdParamSchema,
  },
  responses: {
    200: {
      description: 'Retired pack',
      content: {
        'application/json': {
          schema: PackSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/packs/comparison/{slug}',
  summary: 'Get pack comparison data',
  tags: ['Packs'],
  request: {
    params: SlugParamSchema,
  },
  responses: {
    200: {
      description: 'Pack comparison data',
      content: {
        'application/json': {
          schema: PackComparisonResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/packs/{packId}/metrics',
  summary: 'Get pack performance metrics',
  tags: ['Packs'],
  request: {
    params: PackIdParamSchema,
  },
  responses: {
    200: {
      description: 'Pack metrics',
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
  },
});

// AI Testing Endpoints
registry.registerPath({
  method: 'post',
  path: '/admin/ai-testing/generate-questions',
  summary: 'Generate questions for a service type',
  tags: ['AI Testing'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: GenerateQuestionsRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Generated questions',
      content: {
        'application/json': {
          schema: GenerateQuestionsResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/ai-testing/estimate-price',
  summary: 'Estimate price for a service',
  tags: ['AI Testing'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: EstimatePriceRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Price estimation',
      content: {
        'application/json': {
          schema: EstimatePriceResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/ai-testing/execute',
  summary: 'Execute comprehensive test suite',
  tags: ['AI Testing'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: TestExecutionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Test execution results',
      content: {
        'application/json': {
          schema: TestExecutionResponseSchema,
        },
      },
    },
  },
});

// Professional Matching Endpoints
registry.registerPath({
  method: 'post',
  path: '/admin/professional-matching/match',
  summary: 'Find matching professionals for a job',
  tags: ['Professional Matching'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: MatchProfessionalsRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'List of matched professionals',
      content: {
        'application/json': {
          schema: MatchProfessionalsResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/professional-matching/rank',
  summary: 'Rank and score professional matches',
  tags: ['Professional Matching'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: RankMatchesRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Ranked matches with scores',
      content: {
        'application/json': {
          schema: RankMatchesResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/professional-matching/check-availability',
  summary: 'Check professional availability',
  tags: ['Professional Matching'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CheckAvailabilityRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Availability status',
      content: {
        'application/json': {
          schema: CheckAvailabilityResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/professional-matching/feedback',
  summary: 'Submit feedback on match quality',
  tags: ['Professional Matching'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SubmitMatchFeedbackRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Feedback recorded',
      content: {
        'application/json': {
          schema: SubmitMatchFeedbackResponseSchema,
        },
      },
    },
  },
});

// Discovery Analytics Endpoints
registry.registerPath({
  method: 'post',
  path: '/admin/discovery-analytics/track',
  summary: 'Track analytics event',
  tags: ['Discovery Analytics'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: TrackEventRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Event tracked',
      content: {
        'application/json': {
          schema: TrackEventResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/discovery-analytics/metrics',
  summary: 'Get analytics metrics',
  tags: ['Discovery Analytics'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: GetMetricsRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Analytics metrics',
      content: {
        'application/json': {
          schema: GetMetricsResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/discovery-analytics/conversion-funnel',
  summary: 'Get conversion funnel data',
  tags: ['Discovery Analytics'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: GetConversionFunnelRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Conversion funnel data',
      content: {
        'application/json': {
          schema: GetConversionFunnelResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/discovery-analytics/ab-tests',
  summary: 'Get A/B test results',
  tags: ['Discovery Analytics'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: GetABTestResultsRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'A/B test results',
      content: {
        'application/json': {
          schema: GetABTestResultsResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/admin/discovery-analytics/top-searches',
  summary: 'Get top search queries',
  tags: ['Discovery Analytics'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: GetTopSearchesRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Top search queries',
      content: {
        'application/json': {
          schema: GetTopSearchesResponseSchema,
        },
      },
    },
  },
});

// User Inspector Endpoints
registry.registerPath({
  method: 'get',
  path: '/admin/user-inspector/users',
  summary: 'List all users',
  tags: ['User Inspector'],
  request: {
    query: ListUsersRequestSchema,
  },
  responses: {
    200: {
      description: 'Users retrieved successfully',
      content: {
        'application/json': {
          schema: ListUsersResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/user-inspector/profile/{userId}',
  summary: 'Get user profile',
  tags: ['User Inspector'],
  request: {
    params: z.object({
      userId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'User profile retrieved successfully',
      content: {
        'application/json': {
          schema: GetUserProfileResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/user-inspector/activity/{userId}',
  summary: 'Get user activity log',
  tags: ['User Inspector'],
  request: {
    params: z.object({
      userId: z.string().uuid(),
    }),
    query: z.object({
      limit: z.number().optional(),
    }),
  },
  responses: {
    200: {
      description: 'User activity retrieved successfully',
      content: {
        'application/json': {
          schema: GetUserActivityResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/user-inspector/jobs/{userId}',
  summary: 'Get user jobs',
  tags: ['User Inspector'],
  request: {
    params: z.object({
      userId: z.string().uuid(),
    }),
    query: z.object({
      limit: z.number().optional(),
    }),
  },
  responses: {
    200: {
      description: 'User jobs retrieved successfully',
      content: {
        'application/json': {
          schema: GetUserJobsResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/admin/user-inspector/status',
  summary: 'Update user status/roles',
  tags: ['User Inspector'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateUserStatusRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User status updated successfully',
      content: {
        'application/json': {
          schema: UpdateUserStatusResponseSchema,
        },
      },
    },
  },
});

// Jobs Endpoints
registry.registerPath({
  method: 'post',
  path: '/jobs/draft',
  summary: 'Save job draft',
  tags: ['Jobs'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SaveDraftRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Draft saved successfully',
      content: {
        'application/json': {
          schema: SaveDraftResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/jobs/publish',
  summary: 'Publish a job',
  tags: ['Jobs'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: PublishJobRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Job published successfully',
      content: {
        'application/json': {
          schema: PublishJobResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/jobs/{jobId}',
  summary: 'Get job by ID',
  tags: ['Jobs'],
  request: {
    params: z.object({
      jobId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Job retrieved successfully',
      content: {
        'application/json': {
          schema: GetJobResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/jobs/client/{clientId}',
  summary: 'Get jobs by client',
  tags: ['Jobs'],
  request: {
    params: z.object({
      clientId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Jobs retrieved successfully',
      content: {
        'application/json': {
          schema: GetJobsByClientResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/jobs/open',
  summary: 'Get all open jobs',
  tags: ['Jobs'],
  responses: {
    200: {
      description: 'Open jobs retrieved successfully',
      content: {
        'application/json': {
          schema: GetOpenJobsResponseSchema,
        },
      },
    },
  },
});

// Services Endpoints
registry.registerPath({
  method: 'get',
  path: '/services/micros',
  summary: 'Get all service micros',
  tags: ['Services'],
  responses: {
    200: {
      description: 'Service micros retrieved successfully',
      content: {
        'application/json': {
          schema: GetServiceMicrosResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/services/micros/{id}',
  summary: 'Get service micro by ID',
  tags: ['Services'],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Service micro retrieved successfully',
      content: {
        'application/json': {
          schema: GetServiceMicroByIdResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/services/category/{category}',
  summary: 'Get services by category',
  tags: ['Services'],
  request: {
    params: z.object({
      category: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Services retrieved successfully',
      content: {
        'application/json': {
          schema: GetServicesByCategoryResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/services/categories',
  summary: 'Get all categories',
  tags: ['Services'],
  responses: {
    200: {
      description: 'Categories retrieved successfully',
      content: {
        'application/json': {
          schema: GetCategoriesResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/services/categories/{category}/subcategories',
  summary: 'Get subcategories for a category',
  tags: ['Services'],
  request: {
    params: z.object({
      category: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Subcategories retrieved successfully',
      content: {
        'application/json': {
          schema: GetSubcategoriesResponseSchema,
        },
      },
    },
  },
});

// Offers Endpoints
registry.registerPath({
  method: 'post',
  path: '/offers',
  summary: 'Send a new offer',
  tags: ['Offers'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SendOfferRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Offer sent successfully',
      content: {
        'application/json': {
          schema: SendOfferResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/offers/job/{jobId}',
  summary: 'List offers for a job',
  tags: ['Offers'],
  request: {
    params: z.object({
      jobId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Offers retrieved successfully',
      content: {
        'application/json': {
          schema: ListOffersForJobResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/offers/{offerId}/accept',
  summary: 'Accept an offer',
  tags: ['Offers'],
  request: {
    params: z.object({
      offerId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Offer accepted successfully',
      content: {
        'application/json': {
          schema: AcceptOfferResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/offers/{offerId}/decline',
  summary: 'Decline an offer',
  tags: ['Offers'],
  request: {
    params: z.object({
      offerId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Offer declined successfully',
      content: {
        'application/json': {
          schema: DeclineOfferResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/offers/tasker/{taskerId}',
  summary: 'Get offers by tasker',
  tags: ['Offers'],
  request: {
    params: z.object({
      taskerId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Offers retrieved successfully',
      content: {
        'application/json': {
          schema: GetOffersByTaskerResponseSchema,
        },
      },
    },
  },
});

// Contracts Endpoints
registry.registerPath({
  method: 'post',
  path: '/contracts/from-offer',
  summary: 'Create contract from accepted offer',
  tags: ['Contracts'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateFromOfferRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Contract created successfully',
      content: {
        'application/json': {
          schema: CreateFromOfferResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/contracts/{contractId}',
  summary: 'Get contract by ID',
  tags: ['Contracts'],
  request: {
    params: z.object({
      contractId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Contract retrieved successfully',
      content: {
        'application/json': {
          schema: GetContractResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/contracts/user/{userId}',
  summary: 'Get contracts by user',
  tags: ['Contracts'],
  request: {
    params: z.object({
      userId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Contracts retrieved successfully',
      content: {
        'application/json': {
          schema: GetContractsByUserResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/contracts/{contractId}/in-progress',
  summary: 'Mark contract as in progress',
  tags: ['Contracts'],
  request: {
    params: z.object({
      contractId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Contract marked as in progress',
      content: {
        'application/json': {
          schema: MarkInProgressResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/contracts/{contractId}/complete',
  summary: 'Submit contract completion',
  tags: ['Contracts'],
  request: {
    params: z.object({
      contractId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Contract completion submitted',
      content: {
        'application/json': {
          schema: SubmitCompletionResponseSchema,
        },
      },
    },
  },
});

// Payments Endpoints
registry.registerPath({
  method: 'post',
  path: '/payments/escrow/{contractId}/fund',
  summary: 'Fund escrow for contract',
  tags: ['Payments'],
  request: {
    params: z.object({
      contractId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Escrow funded successfully',
      content: {
        'application/json': {
          schema: FundEscrowResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/payments/escrow/{contractId}/release',
  summary: 'Release escrow payment',
  tags: ['Payments'],
  request: {
    params: z.object({
      contractId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Escrow released successfully',
      content: {
        'application/json': {
          schema: ReleaseEscrowResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/payments/escrow/{contractId}/refund',
  summary: 'Refund escrow',
  tags: ['Payments'],
  request: {
    params: z.object({
      contractId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Escrow refunded successfully',
      content: {
        'application/json': {
          schema: RefundEscrowResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/payments/escrow/balance/{userId}',
  summary: 'Get escrow balance',
  tags: ['Payments'],
  request: {
    params: z.object({
      userId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Escrow balance retrieved successfully',
      content: {
        'application/json': {
          schema: GetEscrowBalanceResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/payments/pending/{userId}',
  summary: 'Get pending payments',
  tags: ['Payments'],
  request: {
    params: z.object({
      userId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Pending payments retrieved successfully',
      content: {
        'application/json': {
          schema: GetPendingPaymentsResponseSchema,
        },
      },
    },
  },
});

// Auth Endpoints
registry.registerPath({
  method: 'get',
  path: '/auth/session',
  summary: 'Get current session',
  tags: ['Auth'],
  responses: {
    200: {
      description: 'Session retrieved successfully',
      content: {
        'application/json': {
          schema: GetSessionResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/signin',
  summary: 'Sign in',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SignInRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Signed in successfully',
      content: {
        'application/json': {
          schema: SignInResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/signup',
  summary: 'Sign up',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SignUpRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Signed up successfully',
      content: {
        'application/json': {
          schema: SignUpResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/signout',
  summary: 'Sign out',
  tags: ['Auth'],
  responses: {
    200: {
      description: 'Signed out successfully',
      content: {
        'application/json': {
          schema: SignOutResponseSchema,
        },
      },
    },
  },
});

// Generate OpenAPI document
const generator = new OpenApiGeneratorV3(registry.definitions);
const document = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'Question Packs API',
    version: '1.0.0',
    description: 'Contract-first API for question pack management and AI testing'
  },
  servers: [
    {
      url: '/api',
      description: 'API server'
    }
  ]
});

// Output JSON
console.log(JSON.stringify(document, null, 2));
