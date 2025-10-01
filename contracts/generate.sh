#!/bin/bash
# Generate OpenAPI specification from Zod schemas
# This script must be run before generating React Query hooks

echo "📝 Generating OpenAPI specification from Zod schemas..."

# Run the TypeScript generator
npx ts-node contracts/src/index.ts > contracts/openapi.yaml

if [ $? -eq 0 ]; then
  echo "✅ OpenAPI spec generated successfully at contracts/openapi.yaml"
  echo ""
  echo "Next steps:"
  echo "1. Run 'npm run contracts:build' to generate React Query hooks"
  echo "2. Import generated hooks from '@contracts/clients/*'"
else
  echo "❌ Failed to generate OpenAPI spec"
  exit 1
fi
