# Error Handling & Recovery Guide

Comprehensive guide for error handling patterns, recovery mechanisms, and user-friendly error experiences implemented in Phase 7.

## Overview

This document covers:
- Error classification and handling
- Error boundaries and fallback UIs
- Retry mechanisms with exponential backoff
- User-friendly error messages
- Error logging and monitoring

## Architecture

### Error Flow

```
User Action → Try Operation
    ↓
Catch Error → Classify Error → Log Error
    ↓
Determine if Retryable
    ↓
Yes: Retry with Backoff → Success/Fail
No: Show User-Friendly Message
    ↓
Offer Recovery Actions
```

## Error Classification

### ErrorType Enum

Location: `src/utils/errorUtils.ts`

```typescript
enum ErrorType {
  NETWORK = 'NETWORK',           // Connection issues
  AUTH = 'AUTH',                 // Authentication/session
  VALIDATION = 'VALIDATION',     // Invalid input
  NOT_FOUND = 'NOT_FOUND',      // Resource not found
  PERMISSION = 'PERMISSION',     // Access denied
  SERVER = 'SERVER',             // Server errors
  UNKNOWN = 'UNKNOWN'            // Unclassified
}
```

### Error Properties

```typescript
interface AppError {
  type: ErrorType;
  message: string;              // Technical message
  userMessage: string;          // User-friendly message
  originalError?: Error;        // Original error object
  retryable: boolean;           // Can it be retried?
  statusCode?: number;          // HTTP status code
}
```

## Error Utilities

### classifyError()

Automatically classifies errors based on message content and properties:

```typescript
import { classifyError } from '@/utils/errorUtils';

try {
  await fetchData();
} catch (error) {
  const classified = classifyError(error);
  console.log(classified.type);        // ErrorType.NETWORK
  console.log(classified.userMessage); // "Unable to connect..."
  console.log(classified.retryable);   // true
}
```

**Classification Rules:**
- Contains "network", "fetch", "offline" → `NETWORK`
- Contains "auth", "unauthorized", "token" → `AUTH`
- Contains "validation", "invalid", "required" → `VALIDATION`
- Contains "not found", "404" → `NOT_FOUND`
- Contains "permission", "forbidden", "403" → `PERMISSION`
- Contains "server", "500", "internal" → `SERVER`
- Default → `UNKNOWN`

### retryWithBackoff()

Implements exponential backoff retry logic:

```typescript
import { retryWithBackoff } from '@/utils/errorUtils';

const data = await retryWithBackoff(
  () => fetchUserData(userId),
  {
    maxRetries: 3,              // Default: 3
    initialDelay: 1000,         // Default: 1000ms
    maxDelay: 10000,            // Default: 10000ms
    backoffMultiplier: 2,       // Default: 2
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt}:`, error);
    }
  }
);
```

**Retry Schedule:**
- Attempt 1: Wait 1s (1000ms)
- Attempt 2: Wait 2s (2000ms)
- Attempt 3: Wait 4s (4000ms)
- Max delay cap: 10s

**Only Retries If:**
- Error is classified as retryable
- Max retries not exceeded

### safeAsync()

Creates error-safe async wrappers:

```typescript
import { safeAsync } from '@/utils/errorUtils';

const safeFetch = safeAsync(
  async (url: string) => {
    const res = await fetch(url);
    return res.json();
  },
  {
    onError: (error) => console.error('Fetch failed:', error),
    fallbackValue: null
  }
);

const data = await safeFetch('/api/users'); // Returns null on error
```

## Error Boundaries

### ErrorBoundary Component

Location: `src/components/error/ErrorBoundary.tsx`

**Features:**
- Catches React component errors
- Shows custom fallback UI
- Logs errors to console/monitoring
- Provides reset and navigation actions
- Shows dev details in development mode

**Usage:**

```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**With Custom Fallback:**

```tsx
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

**With Error Handler:**

```tsx
<ErrorBoundary 
  onError={(error, errorInfo) => {
    // Custom error handling
    logToService(error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Higher-Order Component

```tsx
import { withErrorBoundary } from '@/components/error/ErrorBoundary';

const SafeComponent = withErrorBoundary(
  MyComponent,
  <CustomFallback />,
  (error, errorInfo) => logError(error)
);
```

## Error Fallback Components

Location: `src/components/error/ErrorFallback.tsx`

### Available Fallbacks

#### 1. GenericErrorFallback

General-purpose error display:

```tsx
import { GenericErrorFallback } from '@/components/error/ErrorFallback';

<GenericErrorFallback
  error={error}
  resetErrorBoundary={reset}
  title="Something went wrong"
  message="Please try again"
/>
```

#### 2. NetworkErrorFallback

For connection issues:

```tsx
import { NetworkErrorFallback } from '@/components/error/ErrorFallback';

<NetworkErrorFallback resetErrorBoundary={reset} />
```

**Shows:**
- WiFi off icon
- "Connection Lost" title
- Internet connection check prompt
- Retry button

#### 3. AuthErrorFallback

For authentication errors:

```tsx
import { AuthErrorFallback } from '@/components/error/ErrorFallback';

<AuthErrorFallback />
```

**Shows:**
- Lock icon
- "Session Expired" title
- Sign in redirect button

#### 4. NotFoundErrorFallback

For 404 errors:

```tsx
import { NotFoundErrorFallback } from '@/components/error/ErrorFallback';

<NotFoundErrorFallback message="User not found" />
```

#### 5. ServerErrorFallback

For 500 errors:

```tsx
import { ServerErrorFallback } from '@/components/error/ErrorFallback';

<ServerErrorFallback resetErrorBoundary={reset} />
```

**Shows:**
- Server icon
- "Server Error" title
- Support contact option

### Inline Components

#### InlineError

For form fields and small components:

```tsx
import { InlineError } from '@/components/error/ErrorFallback';

<InlineError 
  message="Failed to save changes" 
  retry={handleRetry}
/>
```

#### LoadingWithError

Combined loading/error/success states:

```tsx
import { LoadingWithError } from '@/components/error/ErrorFallback';

<LoadingWithError
  loading={loading}
  error={error}
  retry={refetch}
>
  <YourContent />
</LoadingWithError>
```

## Hooks

### useErrorHandler

Centralized error handling with toast notifications:

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const MyComponent = () => {
  const { handleError } = useErrorHandler();
  
  const fetchData = async () => {
    try {
      await api.getData();
    } catch (error) {
      handleError(error, { context: 'fetchData', userId });
    }
  };
};
```

**Toast Notifications by Error Type:**
- `NETWORK`: "Connection Error" with retry action
- `AUTH`: "Authentication Required" with sign-in action
- `VALIDATION`: "Invalid Input" message
- `PERMISSION`: "Access Denied" message
- `NOT_FOUND`: "Not Found" message
- `SERVER`: "Server Error" with support contact action

### useAsyncWithError

Handles async operations with loading/error states:

```typescript
import { useAsyncWithError } from '@/hooks/useAsyncWithError';

const MyComponent = () => {
  const { execute, loading, error, data, reset } = useAsyncWithError(
    async (userId: string) => {
      return await fetchUser(userId);
    },
    {
      retry: true,              // Enable retry
      maxRetries: 3,            // Max retry attempts
      onSuccess: (user) => {
        console.log('User loaded:', user);
      },
      onError: (error) => {
        console.error('Failed to load user');
      }
    }
  );
  
  return (
    <div>
      <button onClick={() => execute('123')} disabled={loading}>
        {loading ? 'Loading...' : 'Load User'}
      </button>
      {error && <InlineError message={error.message} retry={reset} />}
      {data && <UserProfile user={data} />}
    </div>
  );
};
```

**Features:**
- Automatic loading state
- Error classification and handling
- Optional retry with backoff
- Success/error callbacks
- Reset function

## Common Patterns

### Pattern 1: Form Submission with Error Handling

```tsx
import { useAsyncWithError } from '@/hooks/useAsyncWithError';
import { InlineError } from '@/components/error/ErrorFallback';

const MyForm = () => {
  const { execute, loading, error } = useAsyncWithError(
    async (formData: FormData) => {
      return await submitForm(formData);
    },
    {
      onSuccess: () => {
        toast.success('Form submitted successfully');
        navigate('/success');
      }
    }
  );
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    execute(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <InlineError message={error.message} />}
      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
};
```

### Pattern 2: Data Fetching with Retry

```tsx
import { useAsyncWithError } from '@/hooks/useAsyncWithError';
import { LoadingWithError } from '@/components/error/ErrorFallback';

const UserList = () => {
  const { execute, loading, error, data } = useAsyncWithError(
    fetchUsers,
    { retry: true, maxRetries: 3 }
  );
  
  useEffect(() => {
    execute();
  }, [execute]);
  
  return (
    <LoadingWithError loading={loading} error={error} retry={execute}>
      <UserListView users={data || []} />
    </LoadingWithError>
  );
};
```

### Pattern 3: Protected Component with Error Boundary

```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { NetworkErrorFallback } from '@/components/error/ErrorFallback';

const ProtectedFeature = () => (
  <ErrorBoundary fallback={<NetworkErrorFallback />}>
    <ComplexFeature />
  </ErrorBoundary>
);
```

### Pattern 4: Manual Error Classification

```tsx
import { classifyError, getUserErrorMessage } from '@/utils/errorUtils';

const handleApiError = (error: unknown) => {
  const classified = classifyError(error);
  
  if (classified.type === ErrorType.AUTH) {
    redirectToLogin();
  } else if (classified.retryable) {
    showRetryOption();
  } else {
    showErrorMessage(classified.userMessage);
  }
};
```

## Error Logging

### Development

Errors are logged to console with full details:

```typescript
console.error('🔴 Error logged:', {
  type: 'NETWORK',
  message: 'Failed to fetch',
  userMessage: 'Unable to connect...',
  timestamp: '2025-01-01T00:00:00Z',
  context: { userId: '123' },
  stack: '...'
});
```

### Production

In production, integrate with monitoring services:

```typescript
// Example: Sentry integration
import * as Sentry from '@sentry/react';

export const logError = (error: unknown, context?: Record<string, any>) => {
  const classified = classifyError(error);
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: {
        type: classified.type,
        userMessage: classified.userMessage,
        ...context
      }
    });
  }
};
```

## User Experience Guidelines

### Error Messages

**DO:**
- Use clear, non-technical language
- Explain what happened
- Provide actionable next steps
- Offer recovery options (retry, go home, contact support)

**DON'T:**
- Show technical stack traces to users
- Use jargon or error codes
- Leave users stuck with no options
- Blame the user

### Recovery Actions

**Always Provide:**
1. **Retry** - For retryable errors
2. **Go Home** - Safe navigation option
3. **Contact Support** - For persistent issues

### Visual Design

**Error States:**
- Use appropriate icons (WiFi off, lock, alert)
- Use semantic colors (destructive for errors, amber for warnings)
- Maintain consistent layout
- Ensure touch-friendly buttons (44px minimum)

## Integration with Existing Components

### Canonical Job Wizard

```tsx
// In QuestionsStep.tsx or LogisticsStep.tsx
import { useAsyncWithError } from '@/hooks/useAsyncWithError';

const { execute: saveAnswers, loading, error } = useAsyncWithError(
  async (answers: Record<string, any>) => {
    return await supabase
      .from('job_answers')
      .insert(answers);
  },
  {
    retry: true,
    onSuccess: () => handleNext()
  }
);
```

### Professional Dashboard

```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ServerErrorFallback } from '@/components/error/ErrorFallback';

<ErrorBoundary fallback={<ServerErrorFallback />}>
  <DashboardStats />
  <LeadsList />
</ErrorBoundary>
```

## Testing Error Scenarios

### Simulate Network Error

```typescript
// Throw network error
throw new Error('Network request failed');
// Classified as: ErrorType.NETWORK
// Retryable: true
```

### Simulate Auth Error

```typescript
throw new Error('Unauthorized - invalid token');
// Classified as: ErrorType.AUTH
// Retryable: false
```

### Simulate Validation Error

```typescript
throw new Error('Validation failed: email is required');
// Classified as: ErrorType.VALIDATION
// Retryable: false
```

## Browser Support

- **Error Boundaries**: All modern browsers
- **Toast Notifications**: All modern browsers
- **Retry Logic**: All modern browsers
- **Exponential Backoff**: All modern browsers

## Future Enhancements

- [ ] Integrate with Sentry for production error tracking
- [ ] Add error analytics dashboard
- [ ] Implement offline error queue
- [ ] Add user feedback collection on errors
- [ ] Smart error prediction based on patterns
- [ ] Automatic error recovery suggestions
- [ ] Error rate limiting for repeated failures
