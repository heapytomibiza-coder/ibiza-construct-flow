/**
 * Jobs API Contract (Zod schemas + OpenAPI)
 * Phase 12: Complete API Standardization
 */

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// ===== Schemas =====

export const DraftJobSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  micro_id: z.string().uuid(),
  answers: z.record(z.any()),
  location: z.record(z.any()).optional(),
  budget_type: z.enum(['fixed', 'hourly']),
  budget_value: z.number().optional(),
}).openapi('DraftJob');

export const JobSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  micro_id: z.string().uuid(),
  answers: z.record(z.any()),
  location: z.record(z.any()).nullable(),
  budget_type: z.enum(['fixed', 'hourly']),
  budget_value: z.number().nullable(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
}).openapi('Job');

// ===== Request/Response Types =====

export const SaveDraftRequestSchema = z.object({
  draft: DraftJobSchema,
}).openapi('SaveDraftRequest');

export const SaveDraftResponseSchema = z.object({
  draftId: z.string(),
}).openapi('SaveDraftResponse');

export const PublishJobRequestSchema = z.object({
  draft: DraftJobSchema,
}).openapi('PublishJobRequest');

export const PublishJobResponseSchema = z.object({
  job: JobSchema,
}).openapi('PublishJobResponse');

export const GetJobResponseSchema = z.object({
  job: JobSchema,
}).openapi('GetJobResponse');

export const GetJobsByClientResponseSchema = z.object({
  jobs: z.array(JobSchema),
}).openapi('GetJobsByClientResponse');

export const GetOpenJobsResponseSchema = z.object({
  jobs: z.array(JobSchema),
}).openapi('GetOpenJobsResponse');

// ===== Registry =====

export const jobsRegistry = {
  '/api/jobs/draft': {
    post: {
      tags: ['jobs'],
      summary: 'Save job draft',
      operationId: 'saveDraft',
      requestBody: {
        content: {
          'application/json': {
            schema: SaveDraftRequestSchema,
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
    },
  },
  '/api/jobs/publish': {
    post: {
      tags: ['jobs'],
      summary: 'Publish a job',
      operationId: 'publishJob',
      requestBody: {
        content: {
          'application/json': {
            schema: PublishJobRequestSchema,
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
    },
  },
  '/api/jobs/{jobId}': {
    get: {
      tags: ['jobs'],
      summary: 'Get job by ID',
      operationId: 'getJob',
      parameters: [
        {
          name: 'jobId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
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
    },
  },
  '/api/jobs/client/{clientId}': {
    get: {
      tags: ['jobs'],
      summary: 'Get jobs by client',
      operationId: 'getJobsByClient',
      parameters: [
        {
          name: 'clientId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
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
    },
  },
  '/api/jobs/open': {
    get: {
      tags: ['jobs'],
      summary: 'Get all open jobs',
      operationId: 'getOpenJobs',
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
    },
  },
};
