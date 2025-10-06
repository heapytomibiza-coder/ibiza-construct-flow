# Testing Guide - Phase 8

## Overview

Comprehensive testing strategy covering unit tests, integration tests, end-to-end tests, performance tests, security tests, and accessibility tests.

## Table of Contents

1. [Test Setup](#test-setup)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [E2E Testing](#e2e-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Running Tests](#running-tests)
9. [Coverage Reports](#coverage-reports)
10. [CI/CD Integration](#cicd-integration)

## Test Setup

### Installation

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8
```

### Configuration

Tests are configured in `vitest.config.ts` with:
- **Environment**: jsdom for React component testing
- **Coverage**: v8 provider with 80% threshold
- **Setup**: Automatic cleanup and global test utilities

## Unit Testing

### Component Tests

Test individual components in isolation:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, userEvent } from '@/test/utils/test-utils';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with text', () => {
    const { getByText } = renderWithProviders(
      <Button>Click me</Button>
    );
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    const { getByText } = renderWithProviders(
      <Button onClick={handleClick}>Click me</Button>
    );
    
    await user.click(getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Tests

Test custom hooks using `renderHook`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWebVitals } from '@/hooks/useWebVitals';

describe('useWebVitals', () => {
  it('collects performance metrics', async () => {
    const { result } = renderHook(() => useWebVitals());

    await waitFor(() => {
      expect(result.current.LCP).toBeDefined();
    });
  });
});
```

### Utility Function Tests

Test pure functions directly:

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency, calculateTotal } from '@/lib/utils';

describe('Utility Functions', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1000)).toBe('€1,000.00');
  });

  it('calculates totals accurately', () => {
    expect(calculateTotal([10, 20, 30])).toBe(60);
  });
});
```

## Integration Testing

### API Integration Tests

Test component interactions with APIs:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, waitFor } from '@/test/utils/test-utils';
import { mockSupabaseClient } from '@/test/utils/test-utils';

describe('Job Posting Flow', () => {
  it('submits job successfully', async () => {
    mockSupabaseClient.from('jobs').insert.mockResolvedValue({
      data: { id: '123' },
      error: null,
    });

    // Test implementation
    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalled();
    });
  });
});
```

### Database Tests

Test RLS policies and database operations:

```typescript
describe('Database Access Control', () => {
  it('enforces RLS on jobs table', async () => {
    // Test that users can only access their own jobs
    // Implementation depends on your database testing setup
  });
});
```

## E2E Testing

### User Journey Tests

Test complete user flows (placeholder for Playwright/Cypress):

```typescript
// Example E2E test structure
describe('Complete Booking Flow', () => {
  it('user can book a service end-to-end', async () => {
    // 1. Navigate to discovery
    // 2. Select service
    // 3. Fill booking form
    // 4. Submit payment
    // 5. Confirm booking
  });
});
```

## Performance Testing

### Bundle Size Tests

Monitor bundle size regression:

```typescript
import { describe, it, expect } from 'vitest';

describe('Bundle Size', () => {
  it('main bundle under 500KB', () => {
    // Check built bundle sizes
  });

  it('route chunks under 150KB', () => {
    // Verify code splitting effectiveness
  });
});
```

### Performance Metrics

Test Web Vitals thresholds:

```typescript
import { describe, it, expect } from 'vitest';
import { getPerformanceStatus } from '@/hooks/useWebVitals';

describe('Performance Metrics', () => {
  it('LCP meets good threshold', () => {
    const status = getPerformanceStatus(2000, 2500, 4000);
    expect(status).toBe('good');
  });
});
```

## Security Testing

### Input Validation Tests

Test input sanitization and validation:

```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Input Validation', () => {
  const emailSchema = z.string().email().max(255);

  it('accepts valid emails', () => {
    expect(() => emailSchema.parse('user@example.com')).not.toThrow();
  });

  it('rejects XSS attempts', () => {
    expect(() => emailSchema.parse('<script>alert(1)</script>')).toThrow();
  });
});
```

### Authentication Tests

Test auth flows and session management:

```typescript
describe('Authentication Security', () => {
  it('protects routes requiring authentication', () => {
    // Test route guards
  });

  it('handles session expiry', () => {
    // Test token refresh
  });
});
```

## Accessibility Testing

### WCAG Compliance Tests

Test accessibility requirements:

```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/utils/test-utils';

describe('WCAG Accessibility', () => {
  it('buttons are keyboard accessible', () => {
    const { getByRole } = renderWithProviders(
      <Button>Accessible</Button>
    );
    
    const button = getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('images have alt text', () => {
    const { getByAltText } = renderWithProviders(
      <img src="/test.jpg" alt="Description" />
    );
    
    expect(getByAltText('Description')).toBeInTheDocument();
  });
});
```

## Running Tests

### Run All Tests

```bash
npm run test
```

### Run Specific Test File

```bash
npm run test src/test/examples/Button.test.tsx
```

### Watch Mode

```bash
npm run test:watch
```

### UI Mode

```bash
npm run test:ui
```

### Coverage Report

```bash
npm run test:coverage
```

## Coverage Reports

### Coverage Thresholds

Configured in `vitest.config.ts`:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Exclusions

Excluded from coverage:
- Test files
- Configuration files
- Type definitions
- Mock data
- Main entry point

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

### 1. Test Naming

```typescript
// ✅ Descriptive test names
it('should display error message when email is invalid', () => {});

// ❌ Vague test names
it('works', () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('calculates discount correctly', () => {
  // Arrange
  const price = 100;
  const discount = 0.2;
  
  // Act
  const result = applyDiscount(price, discount);
  
  // Assert
  expect(result).toBe(80);
});
```

### 3. Mock External Dependencies

```typescript
import { vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));
```

### 4. Test Error Cases

```typescript
it('handles network errors gracefully', async () => {
  mockApi.get.mockRejectedValue(new Error('Network error'));
  
  // Test error handling
});
```

### 5. Avoid Test Interdependence

```typescript
// ✅ Independent tests
beforeEach(() => {
  cleanup();
  resetMocks();
});

// ❌ Tests that depend on each other
```

## Troubleshooting

### Common Issues

**1. Tests timing out**
```typescript
// Increase timeout for slow operations
it('loads large dataset', async () => {
  // Test code
}, 10000); // 10 second timeout
```

**2. Flaky tests**
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

**3. Mock not working**
```typescript
// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Testing Checklist

- [ ] Component renders without errors
- [ ] User interactions work correctly
- [ ] Loading states displayed
- [ ] Error states handled
- [ ] Accessibility requirements met
- [ ] Input validation works
- [ ] Security measures in place
- [ ] Performance within limits
- [ ] Mobile responsive
- [ ] Coverage threshold met

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Next Steps

After Phase 8:
- Implement E2E tests with Playwright
- Add visual regression testing
- Set up performance monitoring
- Automated accessibility audits
- Load testing for production
