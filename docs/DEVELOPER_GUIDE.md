# Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Development Workflow](#development-workflow)
4. [Error Handling](#error-handling)
5. [Testing Strategy](#testing-strategy)
6. [Database Management](#database-management)
7. [Code Standards](#code-standards)

## Project Overview

This is a contract-first React application built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Lovable Cloud (Supabase)
- **State Management**: React Query (TanStack Query) + Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **Validation**: Zod schemas
- **Testing**: Vitest + React Testing Library

## Architecture

### Contract-First Development

All API interactions follow a contract-first approach:
- Type definitions in `src/lib/api/types.ts`
- Validation schemas in `src/lib/validation/`
- Contracts in `src/lib/contracts.ts`
- Generated clients in `packages/@contracts/`

**Never use raw `fetch()` calls.** Always use generated contract clients.

### Key Directories

```
src/
├── components/          # React components
│   ├── dashboards/     # Role-specific dashboards
│   ├── wizard/         # Job posting wizard (LOCKED)
│   └── admin/          # Admin-only components
├── features/           # Feature-specific logic
├── hooks/              # Custom React hooks
├── lib/                # Utilities and core logic
│   ├── api/           # API type definitions
│   ├── contracts.ts   # Data contracts
│   ├── monitoring/    # Health checks & error tracking
│   └── validation/    # Zod schemas
├── pages/             # Route components
└── tests/             # Test files

supabase/
├── functions/         # Edge Functions
│   └── _shared/      # Shared utilities
└── migrations/       # Database migrations
```

### Locked Components (DO NOT MODIFY)

The following files are **LOCKED** and must not be modified without approval:
- `src/pages/PostJob.tsx`
- `src/components/wizard/canonical/` (entire directory)
- `src/features/wizard/useWizard.ts`
- `src/lib/contracts.ts`

These implement the core job posting flow (v1.0 LOCKED SPEC).

## Development Workflow

### 1. Feature Development

```typescript
// 1. Define types in src/lib/api/types.ts
export type MyFeature = {
  id: string;
  name: string;
};

// 2. Create validation schema in src/lib/validation/
import { z } from 'zod';
export const myFeatureSchema = z.object({
  name: z.string().min(1).max(100),
});

// 3. Create custom hook
import { useAsyncWithError } from '@/hooks/useAsyncWithError';
export const useMyFeature = () => {
  const { execute, loading, error } = useAsyncWithError(
    async (data) => {
      // Implementation
    },
    { retry: true }
  );
  return { execute, loading, error };
};

// 4. Use in component
const MyComponent = () => {
  const { execute, loading } = useMyFeature();
  // ...
};
```

### 2. Database Changes

Always use the migration tool for database changes:

```sql
-- Add new table
CREATE TABLE public.my_table (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own records"
ON public.my_table FOR SELECT
USING (auth.uid() = user_id);
```

### 3. Adding Edge Functions

```typescript
// supabase/functions/my-function/index.ts
import { withErrorTracking } from '../_shared/errorHandler.ts';

const handler = async (req: Request): Promise<Response> => {
  // Implementation
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

Deno.serve(withErrorTracking(handler, 'my-function'));
```

## Error Handling

### Client-Side Error Handling

Use the standardized error handling utilities:

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAsyncWithError } from '@/hooks/useAsyncWithError';

// Option 1: Using useErrorHandler
const { handleError } = useErrorHandler();
try {
  await someOperation();
} catch (error) {
  handleError(error, { context: 'MyComponent' });
}

// Option 2: Using useAsyncWithError (recommended)
const { execute, loading, error } = useAsyncWithError(
  someAsyncFunction,
  {
    retry: true,
    maxRetries: 3,
    onError: (err) => console.error('Failed:', err)
  }
);
```

### Error Classification

Errors are automatically classified into types:
- `NETWORK` - Connection issues (retryable)
- `AUTH` - Authentication failures
- `VALIDATION` - Input validation errors
- `NOT_FOUND` - Resource not found
- `PERMISSION` - Authorization failures
- `SERVER` - Internal server errors (retryable)
- `UNKNOWN` - Unclassified errors

### Edge Function Error Handling

```typescript
import { 
  withErrorTracking, 
  errorResponse, 
  validationError,
  authError 
} from '../_shared/errorHandler.ts';

const handler = async (req: Request) => {
  // Validate input
  if (!data.email) {
    return validationError('Email is required');
  }
  
  // Check auth
  if (!user) {
    return authError();
  }
  
  // Your logic here
};

Deno.serve(withErrorTracking(handler, 'function-name'));
```

## Testing Strategy

### Unit Tests

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });
});
```

### Integration Tests

```typescript
// src/tests/contracts/myFeature.test.tsx
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper, createTestQueryClient } from './setup.test';
import { useMyFeature } from '@/hooks/useMyFeature';

describe('useMyFeature', () => {
  it('should fetch data successfully', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = createWrapper(queryClient);
    
    const { result } = renderHook(() => useMyFeature(), { wrapper });
    
    await waitFor(() => expect(result.current.data).toBeDefined());
  });
});
```

### E2E Tests (Planned)

E2E tests will be implemented using Playwright or Cypress for critical user flows:
- User registration and login
- Job posting wizard (all 8 steps)
- Professional profile creation
- Offer submission and acceptance

## Database Management

### RLS Policies

Always enable Row Level Security on new tables:

```sql
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- Read policy
CREATE POLICY "name_select" ON public.my_table
FOR SELECT USING (auth.uid() = user_id);

-- Write policy
CREATE POLICY "name_insert" ON public.my_table
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Performance Indexes

Add indexes for frequently queried columns:

```sql
CREATE INDEX idx_my_table_user_status 
ON public.my_table(user_id, status) 
WHERE status != 'archived';
```

### Health Monitoring

The system includes built-in health checks:

```typescript
import { HealthChecker } from '@/lib/monitoring/healthCheck';

const checker = new HealthChecker(supabase);
const results = await checker.runAllChecks();
```

### Error Tracking

Track errors in Edge Functions:

```typescript
import { ErrorTracker } from '@/lib/monitoring/errorTracking';

const tracker = new ErrorTracker(supabase);
await tracker.logEdgeFunctionError('function-name', error, {
  severity: 'error',
  userId: user?.id
});
```

## Code Standards

### TypeScript

- Use explicit types for function parameters and returns
- Prefer interfaces for objects, types for unions
- Use `unknown` instead of `any` when type is truly unknown
- Enable strict mode gradually (currently disabled for migration)

### React

- Prefer functional components with hooks
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations
- Extract complex logic into custom hooks

### Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMyHook.ts`)
- **Utilities**: camelCase (`myUtil.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)
- **Types/Interfaces**: PascalCase (`MyType`, `MyInterface`)

### File Organization

- One component per file
- Co-locate related files (component + styles + tests)
- Keep files under 300 lines (extract logic to hooks/utils)
- Use barrel exports (`index.ts`) sparingly

### CSS/Styling

- Use Tailwind utility classes
- Use semantic tokens from `index.css` and `tailwind.config.ts`
- **Never** use direct color values like `text-white` or `bg-blue-500`
- Use design system tokens: `bg-background`, `text-foreground`, etc.
- All colors must be in HSL format

### Validation

- All user inputs must be validated client-side AND server-side
- Use Zod schemas for validation
- Validate before external API calls
- Use proper encoding (`encodeURIComponent`) for URLs

### Security Checklist

- ✅ Client-side validation with error messages
- ✅ Input length limits and character restrictions
- ✅ Proper encoding for external APIs
- ✅ No logging of sensitive data
- ✅ RLS policies on all user tables
- ✅ NEVER use anonymous sign-ups

## Common Patterns

### Form Validation

```typescript
import { useValidatedForm } from '@/hooks/useValidatedForm';
import { mySchema } from '@/lib/validation/mySchema';

const MyForm = () => {
  const form = useValidatedForm({
    schema: mySchema,
    defaultValues: { name: '' },
    onValidSubmit: async (data) => {
      // Handle submission
    }
  });
  
  return (
    <form onSubmit={form.handleSubmit}>
      {/* fields */}
    </form>
  );
};
```

### API Calls with React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const useMyData = () => {
  return useQuery({
    queryKey: ['myData'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('my_table')
        .select('*');
      if (error) throw error;
      return data;
    }
  });
};
```

## Troubleshooting

### Common Issues

1. **TypeScript errors after migration**: Clear cache and restart TS server
2. **RLS policy blocking queries**: Check user auth state and policy conditions
3. **Edge function not deploying**: Check for syntax errors and missing imports
4. **Realtime not working**: Verify RLS policies allow SELECT for subscriptions

### Debug Tools

- Console logs: Available in Lovable dev tools
- Network requests: Use Lovable network inspector
- Database: Use backend admin panel
- Error tracking: Check System Health Dashboard

## Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)

---

**Last Updated**: Phase 5 Implementation
**Maintainer**: Development Team
