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

### Phase 6: Admin Control Plane & i18n Standardization ✅

**Admin Service Catalogue Enhancement:**
- Version Control: ServiceCatalogue displays service versions from `micro_questions_snapshot`
- AI Question Approval: Workflow for approving AI-generated questions before publishing
- Publishing System: Admins can publish approved versions to production
- Integration: Full integration with `ServicesRegistry` for real-time service data

**i18n Standardization:**
- New Translation Files: Added `public/locales/en/admin.json` and `public/locales/es/admin.json`
- Comprehensive Keys: Service catalogue, test runner, and feature flags now fully translated
- Locale-Aware Registry: `ServicesRegistry` now responds to language changes

**Test Runner Enhancement:**
- i18n Validation: TestRunner validates that all required i18n keys exist in both EN and ES
- Key Coverage: Validates keys across services, wizard, and common namespaces
- Reporting: Clear pass/fail status for each validated key

**Architecture Complete:**
All 6 phases implemented. The platform now has:
- ✅ Single source of truth for services (`ServicesRegistry`)
- ✅ Centralized role management (`lib/roles.ts`)
- ✅ Unified dashboard pattern
- ✅ Admin control plane with version control
- ✅ Complete i18n standardization
- ✅ Automated validation testing

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

## Conflict Resolutions (Latest)

### Role Management
- **Single Source**: `lib/roles.ts` is the authoritative source for role operations
- **Removed Duplicates**: Eliminated `getActiveRole()` from `useAuth` hook
- **Centralized Persistence**: `switchActiveRole()` handles both DB and localStorage updates
- **No Manual Cache**: Components never write to localStorage directly

### Authentication
- **Fixed Auth Listener**: Removed `async` from `onAuthStateChange` callback in `useAuth`
- **Single Listener**: Dashboard uses `useAuth` hook instead of separate listener
- **Proper Deferral**: Profile fetching uses `setTimeout(0)` to avoid blocking

### Dashboard Preferences
- **Shared Hook**: `useDashboardPreference` eliminates duplicate logic
- **Unified Pattern**: Both client and professional dashboards use same preference system
- **Type-Safe**: Proper TypeScript interfaces for dashboard modes

## Best Practices

### ✅ DO

- Use `useServicesRegistry()` for all service data
- Use `getActiveRole()` from `lib/roles.ts` for role checks
- Use `useDashboardPreference()` for dashboard mode management
- Implement RLS policies on new tables
- Cache data at the context level
- Use semantic tokens from design system
- Defer Supabase calls in auth listeners with `setTimeout(0)`

### ❌ DON'T

- Query `services_unified_v1` directly from components
- Check roles with localStorage only (always use `lib/roles.ts`)
- Duplicate service data logic
- Use direct colors in components
- Create multiple sources of truth
- Use `async` in `onAuthStateChange` callbacks
- Write to localStorage manually (let role functions handle it)
- Duplicate dashboard preference logic
