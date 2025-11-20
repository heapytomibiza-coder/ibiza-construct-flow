# Phase 4: Testing & Validation - UUID Integration

## Overview
Phase 4 implements comprehensive testing for the construction question system with UUID lookup integration.

## Test Coverage

### 1. Unit Tests

#### Construction Question Blocks (`src/lib/data/__tests__/constructionQuestionBlocks.test.ts`)
- ✅ UUID lookup from `micro_services` table
- ✅ Question retrieval for valid services
- ✅ Graceful handling of non-existent services
- ✅ Static JSON fallback behavior
- ✅ Question type mapping validation
- ✅ Edge case handling (empty arrays, null values)

#### Wizard Questions Hook (`src/hooks/__tests__/useWizardQuestions.test.tsx`)
- ✅ Questions and UUID loading
- ✅ Empty categories handling
- ✅ Conditional question filtering
- ✅ Category change reactivity
- ✅ Error handling and recovery
- ✅ Array-based conditional logic

#### Jobs API (`src/lib/api/__tests__/jobs.test.ts`)
- ✅ Draft saving with `microUuid`
- ✅ Job publishing with UUID field
- ✅ Authentication requirements
- ✅ Database error handling
- ✅ Answer serialization
- ✅ Job retrieval with UUIDs
- ✅ Client job filtering
- ✅ Open jobs query

### 2. Integration Points Tested

```
┌─────────────────────────────────────────────┐
│  User selects categories in wizard         │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  useWizardQuestions hook                    │
│  - Calls buildConstructionWizardQuestions   │
│  - Filters conditional questions            │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  buildConstructionWizardQuestions           │
│  - Queries micro_services table             │
│  - Returns slug + UUID                      │
│  - Falls back to static JSON                │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Job submission                             │
│  - Uses micro_id (slug) for compatibility   │
│  - Stores micro_uuid for future lookups     │
│  - Saves to jobs table                      │
└─────────────────────────────────────────────┘
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# Construction question blocks
npm test constructionQuestionBlocks

# Wizard questions hook
npm test useWizardQuestions

# Jobs API
npm test jobs
```

### With Coverage
```bash
npm run test:coverage
```

### Watch Mode (for TDD)
```bash
npm run test:watch
```

## Test Database Setup

Tests use a mock Supabase client that simulates the database:

```typescript
// Seed test data
supabase._seed('micro_services', [{
  id: 'test-uuid-123',
  slug: 'wall-painting',
  category: 'painting',
  subcategory: 'interior',
  name: 'Wall Painting',
  created_at: new Date().toISOString()
}]);

// Reset between tests
supabase._reset();
```

## Key Test Patterns

### 1. Async Hook Testing
```typescript
const { result } = renderHook(() =>
  useWizardQuestions(['painting', 'interior', 'wall-painting'])
);

await waitForLoading(result);

expect(result.current.microUuid).toBe('test-uuid-123');
```

### 2. Mock Data Seeding
```typescript
beforeEach(() => {
  mockSupabase._reset();
  mockSupabase._seed('micro_services', testData);
});
```

### 3. Error Path Testing
```typescript
it('should handle errors gracefully', async () => {
  // Trigger error condition
  const result = await buildConstructionWizardQuestions([]);
  
  // Verify graceful degradation
  expect(result.microUuid).toBeNull();
  expect(result.questions).toEqual([]);
});
```

## Coverage Goals

- **Unit Tests**: 80%+ coverage for core logic
- **Integration Tests**: All UUID lookup paths covered
- **Edge Cases**: Null/undefined/empty values handled
- **Error Paths**: Database errors, network failures

## Future Enhancements

### Phase 5 Recommendations
1. E2E tests for full wizard flow
2. Performance tests for large question sets
3. Accessibility tests for wizard components
4. Visual regression tests
5. Load tests for concurrent UUID lookups

### Test Data Management
- Consider test data factories
- Implement test data versioning
- Add test data seeding scripts
- Create reusable test fixtures

## Validation Checklist

- [x] UUID lookup returns correct values
- [x] Slug fallback works when UUID missing
- [x] Questions filter based on responses
- [x] Job submission includes micro_uuid
- [x] Error states handled gracefully
- [x] Edge cases covered
- [x] Mock data realistic
- [x] Tests are deterministic
- [x] Fast test execution (< 5s total)

## Troubleshooting

### Tests Timing Out
- Check async operations are properly awaited
- Verify mock data is seeded correctly
- Ensure waitForLoading helper is used

### Inconsistent Results
- Reset mocks between tests
- Clear localStorage in beforeEach
- Isolate test state properly

### Mock Issues
- Verify Supabase client mock is imported
- Check seed data structure matches schema
- Ensure vi.mock is called before imports

## Documentation

See also:
- [Testing Infrastructure](../lib/testing/README.md)
- [Mock Supabase Client](../lib/testing/mocks/mockSupabase.ts)
- [Test Utilities](../lib/testing/utils/README.md)
