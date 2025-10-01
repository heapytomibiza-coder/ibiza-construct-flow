# State Management Strategy

## Phase 2: State Synchronization

This directory contains **UI-only state** managed by Zustand. Server state lives in React Query hooks.

## Architecture

```
┌─────────────────────────────────────────┐
│          Component Layer                │
│  (PackBrowser, CompareView, etc.)       │
└─────────────────────────────────────────┘
           │                    │
           │                    │
           ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  Zustand Stores  │  │  React Query     │
│  (UI State)      │  │  (Server State)  │
├──────────────────┤  ├──────────────────┤
│ • Filters        │  │ • Packs list     │
│ • Modal state    │  │ • Mutations      │
│ • Selections     │  │ • Metrics        │
│ • Compare view   │  │ • Cache          │
└──────────────────┘  └──────────────────┘
```

## Stores

### `adminUi.ts`
Manages UI state for admin panels (Asker, Tasker, Website):
- **Filters**: `{ status, source, slug }` - persist filter selections
- **Modals**: Import modal, AI drafter modal open/closed state
- **Compare**: Selected slug for comparison view
- **Selection**: Currently selected pack ID for actions

## Usage Pattern

```typescript
// ❌ WRONG - Don't duplicate server data in Zustand
const useAdminStore = create((set) => ({
  packs: [],           // ❌ Server data in Zustand
  setPacks: (packs) => set({ packs }),
}));

// ✅ CORRECT - Zustand for UI, React Query for server data
import { useAdminUi } from '@/stores/adminUi';
import { useListPacks } from '@/hooks/usePacksQuery';

function PackBrowser() {
  // UI state (filters, selections)
  const { filters, setFilters } = useAdminUi();
  
  // Server state (packs data)
  const { data: packs } = useListPacks(filters);
  
  return (
    <div>
      <input 
        value={filters.slug} 
        onChange={(e) => setFilters({ slug: e.target.value })}
      />
      {packs.map(pack => <PackCard key={pack.pack_id} pack={pack} />)}
    </div>
  );
}
```

## Query Key Standards

All React Query hooks use standardized keys from `src/hooks/usePacksQuery.ts`:

```typescript
export const packKeys = {
  all: ['packs'],
  lists: () => [...packKeys.all, 'list'],
  list: (filters) => [...packKeys.lists(), filters],
  comparison: (slug) => [...packKeys.all, 'comparison', slug],
  metrics: (packId) => [...packKeys.all, 'metrics', packId],
};
```

This ensures:
- ✅ Consistent cache invalidation across all admin panels
- ✅ Easy debugging (predictable query keys)
- ✅ No stale data between components

## Migration from Local State

### Before (useState)
```typescript
function PackBrowser() {
  const [filters, setFilters] = useState({ status: '', source: '', slug: '' });
  const [compareSlug, setCompareSlug] = useState<string>();
  
  const { data: packs } = useQuery({
    queryKey: ['question-packs', filters],
    queryFn: () => listPacks(filters),
  });
}
```

### After (Zustand + standardized hooks)
```typescript
function PackBrowser() {
  const { filters, setFilters, compareSlug, setCompareSlug } = useAdminUi();
  const { data: packs } = useListPacks(filters);
}
```

## Benefits

✅ **Shared UI state** - Filters persist when navigating between tabs  
✅ **Separation of concerns** - UI state vs server state clearly divided  
✅ **Consistent query keys** - Same cache behavior across all panels  
✅ **Type safety** - Zustand + React Query both fully typed  
✅ **Easy testing** - UI state and server state tested independently  

## Next Steps (Phase 3)

Once contracts are generated, migrate from manual hooks to generated ones:

```typescript
// Current (manual hooks)
import { useListPacks } from '@/hooks/usePacksQuery';

// Future (generated hooks)
import { useListPacks } from '@contracts/clients/packs';
```

Generated hooks will have identical signatures, making migration seamless.
