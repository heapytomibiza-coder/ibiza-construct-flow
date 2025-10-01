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
