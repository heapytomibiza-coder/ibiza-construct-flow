#!/bin/bash
# Generate React Query hooks from OpenAPI specification
# Must run contracts:generate first to create openapi.yaml

echo "🔧 Generating React Query hooks from OpenAPI spec..."

# Check if openapi.yaml exists
if [ ! -f "contracts/openapi.yaml" ]; then
  echo "❌ OpenAPI spec not found. Run 'npm run contracts:generate' first."
  exit 1
fi

# Generate all clients
echo "Generating Question Packs client..."
npx orval --config contracts/orval.config.cjs --project question-packs

echo "Generating AI Testing client..."
npx orval --config contracts/orval.config.cjs --project ai-testing

echo "Generating Professional Matching client..."
npx orval --config contracts/orval.config.cjs --project professional-matching

echo "Generating Discovery Analytics client..."
npx orval --config contracts/orval.config.cjs --project discovery-analytics

echo "Generating User Inspector client..."
npx orval --config contracts/orval.config.cjs --project user-inspector

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ All React Query hooks generated successfully!"
  echo ""
  echo "Generated clients:"
  echo "  - packages/@contracts/clients/packs.ts"
  echo "  - packages/@contracts/clients/ai-testing.ts"
  echo "  - packages/@contracts/clients/professional-matching.ts"
  echo "  - packages/@contracts/clients/discovery-analytics.ts"
  echo "  - packages/@contracts/clients/user-inspector.ts"
  echo ""
  echo "Usage example:"
  echo "  import { useGetAdminPacks } from '@contracts/clients/packs';"
  echo "  const { data, isLoading } = useGetAdminPacks();"
else
  echo "❌ Failed to generate React Query hooks"
  exit 1
fi
