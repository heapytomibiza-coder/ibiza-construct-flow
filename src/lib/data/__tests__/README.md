# Construction Question Blocks Tests

## Overview
This directory contains tests for the construction question system with UUID integration.

## Test Coverage

### constructionQuestionBlocks.test.ts
Tests the `buildConstructionWizardQuestions` function which:
- Looks up micro service UUIDs from the database
- Returns construction questions for valid services
- Handles non-existent services gracefully
- Maps question types correctly
- Falls back to static JSON data when needed

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test constructionQuestionBlocks.test.ts
```

## Test Structure

Each test follows this pattern:
1. **Setup**: Seed mock data using `supabase._seed()`
2. **Execute**: Call the function under test
3. **Assert**: Verify expected behavior
4. **Cleanup**: Reset mocks using `supabase._reset()`

## Mock Data

The tests use the mock Supabase client which provides:
- In-memory database simulation
- Seed data capabilities
- Predictable test environment

Example mock micro service:
```typescript
{
  id: 'test-uuid-123',
  slug: 'wall-painting',
  category: 'painting',
  subcategory: 'interior',
  name: 'Wall Painting',
  created_at: new Date().toISOString()
}
```

## Key Test Scenarios

1. **UUID Lookup**: Verifies correct UUID retrieval from database
2. **Static Fallback**: Tests fallback to JSON data when DB is empty
3. **Error Handling**: Ensures graceful degradation on errors
4. **Question Mapping**: Validates correct question type transformations
5. **Edge Cases**: Empty arrays, null values, missing data
