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

All components now use `ServicesRegistry` directly:

**Wizard Components:**
- `Cascader.tsx` - Service selection UI
- `PostJobView.tsx` - Job creation flow
- `EnhancedJobWizard.tsx` - Enhanced wizard interface
- `LuxuryJobWizard.tsx` - Premium wizard experience
- `useWizard.ts` - Wizard state management

**Service Display:**
- `Services.tsx` - Service listing
- `ExpressModeSection.tsx` - Quick service access
- `FeaturedServicesCarousel.tsx` - Featured services display

**Dashboard Components:**
- `ClientDashboard.tsx` - Client dashboard

**Discovery & Pages:**
- `Discovery.tsx` - Service discovery
- `Services.tsx` - Services page
- `UnifiedServicePage.tsx` - Unified service view

### Deprecated (Phase 5)

- ⚠️ `useServices` hook - Thin wrapper, use `useServicesRegistry` directly in new code

### Removed Files (Phase 4)

- ❌ `ServicesContext.tsx` - Replaced by ServicesRegistry
- ❌ `ServicesProvider.tsx` - Replaced by ServicesRegistry

## Migration Summary

### Phase 1: Create ServicesRegistry ✅
Created unified `ServicesRegistry` with intelligent caching and question resolution

### Phase 2: Migrate Core Components ✅
Updated `PostJobView`, `EnhancedJobWizard`, `useWizard`, and `Services` to use registry

### Phase 3: Centralize Role Management ✅
Unified role logic in `lib/roles.ts` and updated `RouteGuard`, `HeaderRoleSwitcher`, and `useActiveRole`

### Phase 4: Remove Redundant Contexts ✅
Deleted duplicate `ServicesContext.tsx` and `ServicesProvider.tsx`

### Phase 5: Final Migration ✅
Migrated all remaining components from `useServices` to `useServicesRegistry`:
- `ExpressModeSection`, `FeaturedServicesCarousel`, `ClientDashboard`
- `Discovery`, `Services`, `UnifiedServicePage`
- `LuxuryJobWizard` (removed direct Supabase queries)

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
