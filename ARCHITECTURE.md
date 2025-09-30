# Architecture Documentation

## Services Data Flow

### Single Source of Truth: ServicesRegistry

All service-related data flows through `src/contexts/ServicesRegistry.tsx`, which:
- Fetches from `services_unified_v1` table
- Implements intelligent caching
- Resolves questions with strict hierarchy: snapshot → AI-generated → fallback
- Provides centralized methods for all service data access

### Data Access Pattern

```typescript
// ✅ CORRECT: Use the registry hook
import { useServicesRegistry } from '@/contexts/ServicesRegistry';

const { services, getQuestions, getServiceCards } = useServicesRegistry();
```

```typescript
// ❌ DEPRECATED: Direct Supabase calls
const { data } = await supabase.from('services_unified_v1').select('*');
```

### Components Using Registry

- `Cascader.tsx` - Service selection UI
- `PostJobView.tsx` - Job creation flow
- `EnhancedJobWizard.tsx` - Wizard interface
- `useWizard.ts` - Wizard state management
- `Services.tsx` - Service listing

### Removed Files (Phase 4)

- ❌ `ServicesContext.tsx` - Replaced by ServicesRegistry
- ❌ `ServicesProvider.tsx` - Replaced by ServicesRegistry

## Role Management

### Centralized in `lib/roles.ts`

Role resolution follows clear precedence: **Admin > Professional > Client**

```typescript
import { getActiveRole, getDashboardRoute, switchActiveRole } from '@/lib/roles';

// Get current active role
const role = await getActiveRole();

// Get dashboard path
const path = getDashboardRoute(role);

// Switch roles
await switchActiveRole('professional');
```

### Role Components

- `RouteGuard.tsx` - Route protection
- `HeaderRoleSwitcher.tsx` - UI for switching
- `useActiveRole.ts` - React hook with localStorage cache

## Dashboard Architecture

### Unified Dashboard Pattern

Each role has a unified dashboard that routes to different modes:

```
UnifiedClientDashboard
├── Simple Mode
├── Enhanced Mode
└── Classic Mode (fallback)

UnifiedProfessionalDashboard
├── Simple Mode
└── Enhanced Mode
```

User preferences are persisted per user and respect feature flags.

## Best Practices

### ✅ DO

- Use `useServicesRegistry()` for all service data
- Use `getActiveRole()` for role checks
- Implement RLS policies on new tables
- Cache data at the context level
- Use semantic tokens from design system

### ❌ DON'T

- Query `services_unified_v1` directly from components
- Check roles with localStorage only
- Duplicate service data logic
- Use direct colors in components
- Create multiple sources of truth
