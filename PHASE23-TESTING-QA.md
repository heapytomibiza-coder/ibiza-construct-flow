# Phase 23: Testing & Quality Assurance System

## Overview
Comprehensive testing infrastructure with utilities for unit testing, integration testing, mock factories, accessibility testing, and test coverage reporting.

## Features Implemented

### 1. Testing Utilities
- **Render with Providers**: Automatically wrap components with necessary providers
- **Test Helpers**: Common testing patterns (form filling, clicking, waiting)
- **Async Utilities**: Wait for conditions, values, and network idle
- **Accessibility Utilities**: Check for a11y compliance

### 2. Mock Factories
- **User Factory**: Generate test users with various roles
- **Mock Supabase Client**: Full Supabase client mock with CRUD operations
- **Mock Router**: React Router mock for navigation testing
- **Configurable Mocks**: Delay, error, and return value configuration

### 3. Test Setup & Configuration
- **Global Setup**: Automatic cleanup, mock configuration
- **Vitest Config**: Coverage thresholds, reporters, paths
- **Jest DOM**: Extended matchers for DOM testing
- **Mock Browser APIs**: matchMedia, IntersectionObserver, ResizeObserver

### 4. Accessibility Testing
- **A11y Validators**: Check names, roles, keyboard access, labels
- **Violation Detection**: Find and report accessibility issues
- **WCAG Compliance**: Basic contrast and semantic checks
- **Assertion Helpers**: Fail tests on a11y violations

### 5. Example Tests
- **Component Tests**: Button component test suite
- **Test Patterns**: Best practices demonstrated
- **Coverage Setup**: 80% threshold for lines, functions, branches

## Architecture

### Test Structure
```
src/lib/testing/
├── types.ts              # Testing type definitions
├── factories/            # Test data factories
│   ├── userFactory.ts
│   └── index.ts
├── mocks/               # Mock implementations
│   ├── mockSupabase.ts
│   ├── mockRouter.ts
│   └── index.ts
├── utils/               # Testing utilities
│   ├── renderWithProviders.tsx
│   ├── waitForAsync.ts
│   ├── testHelpers.ts
│   ├── accessibility.ts
│   └── index.ts
├── setup.ts             # Global test setup
└── index.ts             # Main exports
```

## Usage Examples

### Basic Component Test

```tsx
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/lib/testing';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Test with User Interaction

```tsx
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '@/lib/testing';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits form with credentials', async () => {
    const handleSubmit = vi.fn();
    renderWithProviders(<LoginForm onSubmit={handleSubmit} />);
    
    await userEvent.type(
      screen.getByLabelText('Email'),
      'test@example.com'
    );
    await userEvent.type(
      screen.getByLabelText('Password'),
      'password123'
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Login' })
    );
    
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### Test with Async Operations

```tsx
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/lib/testing';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('loads and displays user data', async () => {
    renderWithProviders(<UserProfile userId="123" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

### Test with Mock Supabase

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '@/lib/testing';
import { createMockSupabaseClient } from '@/lib/testing';
import { TaskList } from './TaskList';

describe('TaskList', () => {
  let mockSupabase: any;
  
  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockSupabase._seed('tasks', [
      { id: '1', title: 'Task 1', completed: false },
      { id: '2', title: 'Task 2', completed: true },
    ]);
  });
  
  it('displays tasks from database', async () => {
    renderWithProviders(<TaskList />);
    
    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(await screen.findByText('Task 2')).toBeInTheDocument();
  });
});
```

### Test with User Factory

```tsx
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/lib/testing';
import { createAdminUser, createCustomerUser } from '@/lib/testing';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('shows admin features for admin users', () => {
    const admin = createAdminUser();
    renderWithProviders(<Dashboard user={admin} />);
    
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });
  
  it('hides admin features for customer users', () => {
    const customer = createCustomerUser();
    renderWithProviders(<Dashboard user={customer} />);
    
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });
});
```

### Test with Custom Route

```tsx
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/lib/testing';
import { ProductPage } from './ProductPage';

describe('ProductPage', () => {
  it('loads product from route parameter', () => {
    renderWithProviders(<ProductPage />, {
      initialRoute: '/products/123',
    });
    
    expect(screen.getByText('Product #123')).toBeInTheDocument();
  });
});
```

### Accessibility Testing

```tsx
import { describe, it } from 'vitest';
import { renderWithProviders, assertAccessible } from '@/lib/testing';
import { ContactForm } from './ContactForm';

describe('ContactForm accessibility', () => {
  it('has no accessibility violations', () => {
    const { container } = renderWithProviders(<ContactForm />);
    assertAccessible(container);
  });
});
```

### Test Helpers

```tsx
import { describe, it, expect } from 'vitest';
import { 
  renderWithProviders, 
  screen,
  typeIntoInput,
  clickButton,
  selectOption,
  fillForm,
  waitForToast,
} from '@/lib/testing';
import { RegistrationForm } from './RegistrationForm';

describe('RegistrationForm', () => {
  it('completes registration flow', async () => {
    renderWithProviders(<RegistrationForm />);
    
    // Fill out form
    await fillForm({
      'First Name': 'John',
      'Last Name': 'Doe',
      'Email': 'john@example.com',
    });
    
    await selectOption('Country', 'United States');
    await clickButton('Register');
    
    // Wait for success message
    await waitForToast('Registration successful');
  });
});
```

## Test Coverage

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test -- button.test.tsx
```

### Coverage Thresholds

Configured in `vitest.config.ts`:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

### Coverage Reports

- **Text**: Console output
- **HTML**: `coverage/index.html`
- **LCOV**: `coverage/lcov.info`
- **JSON**: `coverage/coverage-final.json`

## Best Practices

### 1. Test Organization
```tsx
describe('ComponentName', () => {
  describe('rendering', () => {
    it('renders with default props', () => {});
    it('renders with custom props', () => {});
  });
  
  describe('interactions', () => {
    it('handles click events', () => {});
    it('handles form submission', () => {});
  });
  
  describe('edge cases', () => {
    it('handles empty state', () => {});
    it('handles error state', () => {});
  });
});
```

### 2. Mock Data
```tsx
// Use factories for consistent test data
const user = createTestUser({ role: 'admin' });

// Seed mock database
mockSupabase._seed('users', [user]);
```

### 3. Async Testing
```tsx
// Wait for element to appear
await screen.findByText('Success');

// Wait for condition
await waitFor(() => {
  expect(mockApi).toHaveBeenCalled();
});

// Wait for element to be removed
await waitForElementToBeRemoved(() => screen.queryByText('Loading'));
```

### 4. Accessibility
```tsx
// Always test keyboard navigation
button.focus();
await userEvent.keyboard('{Enter}');

// Check for ARIA labels
expect(screen.getByLabelText('Close')).toBeInTheDocument();

// Verify no a11y violations
assertAccessible(container);
```

### 5. Cleanup
```tsx
// Automatic cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

## Common Patterns

### Testing Hooks

```tsx
import { renderHook } from '@testing-library/react';
import { useMyHook } from './useMyHook';

it('updates value', () => {
  const { result } = renderHook(() => useMyHook());
  
  expect(result.current.value).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.value).toBe(1);
});
```

### Testing Context

```tsx
function renderWithContext(ui: React.ReactElement, contextValue: any) {
  return renderWithProviders(
    <MyContext.Provider value={contextValue}>
      {ui}
    </MyContext.Provider>
  );
}
```

### Testing Redux/Zustand

```tsx
import { Provider } from 'react-redux';
import { store } from './store';

function renderWithRedux(ui: React.ReactElement) {
  return renderWithProviders(
    <Provider store={store}>{ui}</Provider>
  );
}
```

## Troubleshooting

### Tests Timeout
```tsx
// Increase timeout for slow operations
await waitFor(() => {
  expect(element).toBeInTheDocument();
}, { timeout: 5000 });
```

### Act Warnings
```tsx
// Wrap state updates in act()
import { act } from '@testing-library/react';

act(() => {
  // State update code
});
```

### Mock Not Working
```tsx
// Ensure mocks are cleared between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Dependencies

- **vitest**: Test runner
- **@testing-library/react**: React testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom matchers
- **@vitest/coverage-v8**: Coverage provider

## Next Steps

1. Write tests for critical components
2. Achieve 80% coverage threshold
3. Set up CI/CD pipeline
4. Add visual regression testing
5. Implement E2E tests with Playwright
6. Add performance benchmarks
