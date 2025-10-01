/**
 * Orval configuration for generating typed React Query hooks
 * Generates drop-in replacements for manual useQuery/useMutation calls
 * 
 * Usage:
 * 1. Generate OpenAPI spec: npm run contracts:generate
 * 2. Generate React Query hooks: npm run contracts:build
 */

module.exports = {
  // Question Packs API
  'question-packs': {
    input: {
      target: './contracts/openapi.yaml',
    },
    output: {
      target: './packages/@contracts/clients/packs.ts',
      client: 'react-query',
      mode: 'tags-split',
      mock: false,
      override: {
        mutator: {
          path: './src/lib/api/index.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },

  // AI Testing API
  'ai-testing': {
    input: {
      target: './contracts/openapi.yaml',
      filters: {
        tags: ['AI Testing'],
      },
    },
    output: {
      target: './packages/@contracts/clients/ai-testing.ts',
      client: 'react-query',
      mode: 'tags-split',
      mock: false,
      override: {
        mutator: {
          path: './src/lib/api/index.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },

  // Professional Matching API
  'professional-matching': {
    input: {
      target: './contracts/openapi.yaml',
      filters: {
        tags: ['Professional Matching'],
      },
    },
    output: {
      target: './packages/@contracts/clients/professional-matching.ts',
      client: 'react-query',
      mode: 'tags-split',
      mock: false,
      override: {
        mutator: {
          path: './src/lib/api/index.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },

  // Discovery Analytics API
  'discovery-analytics': {
    input: {
      target: './contracts/openapi.yaml',
      filters: {
        tags: ['Discovery Analytics'],
      },
    },
    output: {
      target: './packages/@contracts/clients/discovery-analytics.ts',
      client: 'react-query',
      mode: 'tags-split',
      mock: false,
      override: {
        mutator: {
          path: './src/lib/api/index.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },

  // User Inspector API
  'user-inspector': {
    input: {
      target: './contracts/openapi.yaml',
      filters: {
        tags: ['User Inspector'],
      },
    },
    output: {
      target: './packages/@contracts/clients/user-inspector.ts',
      client: 'react-query',
      mode: 'tags-split',
      mock: false,
      override: {
        mutator: {
          path: './src/lib/api/index.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
};
