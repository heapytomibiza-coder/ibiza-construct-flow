/**
 * Orval configuration for generating typed React Query hooks
 * Generates drop-in replacements for manual useQuery/useMutation calls
 */

module.exports = {
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
};
