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

// Generate OpenAPI document
const generator = new OpenApiGeneratorV3(registry.definitions);

const document = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'Question Packs API',
    version: '1.0.0',
    description: 'Contract-first API for question packs management across Asker, Tasker, and Website admin',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
});

// Output JSON
console.log(JSON.stringify(document, null, 2));
