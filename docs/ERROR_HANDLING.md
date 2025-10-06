# Error Handling Guide

## Overview

This project uses a comprehensive, standardized error handling system that provides:
- Automatic error classification
- User-friendly error messages
- Retry logic with exponential backoff
- Centralized error logging
- Toast notifications for user feedback

## Client-Side Error Handling

### useErrorHandler Hook

The primary hook for handling errors in React components:

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const MyComponent = () => {
  const { handleError } = useErrorHandler();
  
  const doSomething = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      handleError(error, { 
        functionName: 'doSomething',
        userId: user?.id 
      });
    }
  };
};
```

**Features:**
- Automatically classifies errors into types
- Logs errors with context
- Shows user-friendly toast notifications
- Provides retry actions for retryable errors

### useAsyncWithError Hook

Recommended for async operations with built-in error handling:

```typescript
import { useAsyncWithError } from '@/hooks/useAsyncWithError';

const MyComponent = () => {
  const { execute, loading, error, data } = useAsyncWithError(
    async (id: string) => {
      const { data } = await supabase
        .from('table')
        .select('*')
        .eq('id', id)
        .single();
      return data;
    },
    {
      retry: true,           // Enable automatic retries
      maxRetries: 3,         // Max 3 retry attempts
      onSuccess: (data) => {
        toast.success('Operation successful!');
      },
      onError: (error) => {
        console.error('Failed:', error);
      }
    }
  );
  
  return (
    <Button 
      onClick={() => execute(itemId)} 
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Load Data'}
    </Button>
  );
};
```

**Features:**
- Automatic loading state management
- Built-in retry logic with exponential backoff
- Success/error callbacks
- Automatic error classification and logging

## Error Types

Errors are automatically classified into the following types:

### NETWORK
Connection and network-related errors
- **Retryable**: Yes
- **User Message**: "Network error. Please check your connection."
- **Examples**: 
  - `fetch failed`
  - `NetworkError`
  - `Failed to fetch`

### AUTH
Authentication and authorization errors
- **Retryable**: No
- **User Message**: "Authentication failed. Please log in again."
- **Examples**:
  - `Invalid credentials`
  - `Unauthorized`
  - `Session expired`

### VALIDATION
Input validation errors
- **Retryable**: No
- **User Message**: "Invalid input. Please check your data."
- **Examples**:
  - `Validation failed`
  - `Invalid email format`
  - `Required field missing`

### NOT_FOUND
Resource not found errors
- **Retryable**: No
- **User Message**: "Resource not found."
- **Examples**:
  - `404`
  - `not found`
  - `does not exist`

### PERMISSION
Permission and access control errors
- **Retryable**: No
- **User Message**: "You don't have permission to perform this action."
- **Examples**:
  - `Forbidden`
  - `Access denied`
  - `Insufficient permissions`

### SERVER
Internal server errors
- **Retryable**: Yes
- **User Message**: "Server error. Please try again."
- **Examples**:
  - `500`
  - `Internal server error`
  - `Service unavailable`

### UNKNOWN
Unclassified errors
- **Retryable**: No
- **User Message**: "An unexpected error occurred."
- **Examples**: Any error not matching other patterns

## Error Utilities

### classifyError

Classify any error into a structured `AppError`:

```typescript
import { classifyError } from '@/utils/errorUtils';

try {
  await operation();
} catch (error) {
  const classified = classifyError(error);
  console.log(classified.type);        // 'NETWORK'
  console.log(classified.userMessage);  // User-friendly message
  console.log(classified.retryable);    // true/false
}
```

### retryWithBackoff

Retry an operation with exponential backoff:

```typescript
import { retryWithBackoff } from '@/utils/errorUtils';

const result = await retryWithBackoff(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  {
    maxRetries: 3,              // Max 3 attempts
    initialDelay: 1000,         // Start with 1s delay
    maxDelay: 10000,           // Cap at 10s delay
    backoffMultiplier: 2,      // Double delay each time
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt}:`, error);
    }
  }
);
```

### safeAsync

Wrap async functions to catch and log errors:

```typescript
import { safeAsync } from '@/utils/errorUtils';

const safeFetch = safeAsync(
  async (url: string) => {
    const response = await fetch(url);
    return response.json();
  },
  {
    onError: (error) => {
      console.error('Fetch failed:', error);
    },
    fallbackValue: null  // Return null on error
  }
);

// Usage - never throws, always returns result or fallback
const data = await safeFetch('/api/data');
```

### logError

Log errors with context (development/production aware):

```typescript
import { logError } from '@/utils/errorUtils';

logError(error, {
  component: 'MyComponent',
  action: 'submitForm',
  userId: user?.id,
  metadata: { formData }
});
```

## Edge Function Error Handling

### withErrorTracking

Wrap Edge Function handlers for automatic error tracking:

```typescript
import { withErrorTracking } from '../_shared/errorHandler.ts';

const handler = async (req: Request): Promise<Response> => {
  // Your logic here
  return new Response(JSON.stringify({ success: true }));
};

// Wraps handler with error tracking
Deno.serve(withErrorTracking(handler, 'my-function'));
```

**Features:**
- Automatically catches and logs errors
- Returns standardized error responses
- Tracks errors in `edge_function_errors` table
- Includes request context in error logs

### Standard Error Responses

Use standardized error response helpers:

```typescript
import { 
  errorResponse, 
  validationError, 
  authError,
  rateLimitError 
} from '../_shared/errorHandler.ts';

// Generic error
return errorResponse('Something went wrong', 500);

// Validation error (400)
return validationError('Email is required');

// Auth error (401)
return authError('Invalid token');

// Rate limit error (429)
return rateLimitError();
```

### Manual Error Logging

Log errors manually in Edge Functions:

```typescript
import { logEdgeFunctionError } from '../_shared/errorHandler.ts';

try {
  await riskyOperation();
} catch (error) {
  await logEdgeFunctionError(supabaseClient, error as Error, {
    functionName: 'my-function',
    requestData: { userId: user.id },
    userId: user.id,
    severity: 'error'
  });
  throw error;
}
```

## Error Monitoring

### System Health Dashboard

Access the System Health Dashboard (Admin only) to:
- View unresolved errors across all Edge Functions
- See error counts by severity (warning, error, critical)
- Resolve errors once fixed
- Track error trends

Location: Admin Dashboard → System Health

### Error Tracking Class

Programmatically track and query errors:

```typescript
import { ErrorTracker } from '@/lib/monitoring/errorTracking';

const tracker = new ErrorTracker(supabase);

// Log an error
await tracker.logEdgeFunctionError('function-name', error, {
  severity: 'critical',
  userId: user?.id,
  requestData: { action: 'submit' }
});

// Get unresolved errors summary
const summary = await tracker.getUnresolvedErrorsSummary();
console.log(summary.totalUnresolved);
console.log(summary.criticalCount);

// Resolve an error
await tracker.resolveError(errorId);

// Get errors for specific function
const errors = await tracker.getFunctionErrors('my-function', 10);
```

## Best Practices

### 1. Always Validate Input

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100)
});

// Client-side
const result = schema.safeParse(formData);
if (!result.success) {
  return validationError('Invalid form data');
}

// Server-side (Edge Function)
try {
  schema.parse(requestData);
} catch (error) {
  return validationError('Validation failed');
}
```

### 2. Use Appropriate Error Types

```typescript
// User not authenticated
if (!user) {
  return authError('Please log in');
}

// Resource not found
if (!record) {
  return errorResponse('Record not found', 404, 'NOT_FOUND');
}

// Rate limit exceeded
if (requestCount > limit) {
  return rateLimitError();
}
```

### 3. Provide Context in Errors

```typescript
const { handleError } = useErrorHandler();

try {
  await updateProfile(data);
} catch (error) {
  handleError(error, {
    functionName: 'updateProfile',
    userId: user.id,
    profileData: data  // Helps debugging
  });
}
```

### 4. Use Retry for Transient Failures

```typescript
// Network requests that might fail temporarily
const { execute } = useAsyncWithError(fetchData, { 
  retry: true,
  maxRetries: 3 
});

// Use retryWithBackoff for critical operations
const result = await retryWithBackoff(saveToDatabase, {
  maxRetries: 5,
  initialDelay: 1000
});
```

### 5. Don't Log Sensitive Data

```typescript
// ❌ BAD - Logs sensitive data
logError(error, { password: user.password });

// ✅ GOOD - Logs only necessary info
logError(error, { userId: user.id, action: 'login' });
```

### 6. Handle Edge Cases

```typescript
const { execute, error } = useAsyncWithError(fetchUser);

if (error) {
  // Show user-friendly fallback
  return <ErrorState message="Unable to load user data" />;
}
```

## Testing Error Handling

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { classifyError } from '@/utils/errorUtils';

describe('Error Classification', () => {
  it('should classify network errors', () => {
    const error = new Error('fetch failed');
    const classified = classifyError(error);
    
    expect(classified.type).toBe('NETWORK');
    expect(classified.retryable).toBe(true);
  });
  
  it('should classify auth errors', () => {
    const error = new Error('Unauthorized');
    const classified = classifyError(error);
    
    expect(classified.type).toBe('AUTH');
    expect(classified.retryable).toBe(false);
  });
});
```

### Integration Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useAsyncWithError } from '@/hooks/useAsyncWithError';

it('should retry on failure', async () => {
  let attempts = 0;
  const failTwice = async () => {
    attempts++;
    if (attempts < 3) throw new Error('Network error');
    return 'success';
  };
  
  const { result } = renderHook(() => 
    useAsyncWithError(failTwice, { retry: true, maxRetries: 3 })
  );
  
  await result.current.execute();
  
  await waitFor(() => {
    expect(result.current.data).toBe('success');
    expect(attempts).toBe(3);
  });
});
```

## Troubleshooting

### Error Not Being Caught
- Ensure you're using try/catch or async error boundaries
- Check if error is thrown vs returned
- Verify error handler is called

### Retry Not Working
- Check if error is classified as retryable
- Verify maxRetries is set correctly
- Check network conditions (might be offline)

### Errors Not Logging
- Verify Supabase connection
- Check RLS policies on error tables
- Ensure user has permission to write errors

### Toast Not Showing
- Check if toast container is rendered
- Verify useErrorHandler is called correctly
- Check browser console for React errors

---

**Last Updated**: Phase 5 Implementation
**Related**: `docs/DEVELOPER_GUIDE.md`, `docs/TESTING_VALIDATION.md`
