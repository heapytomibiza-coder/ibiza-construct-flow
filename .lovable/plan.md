
# Public Job Board & Action-Point Gating Refactor

## Overview

This refactor makes the job board publicly browsable while gating professional-only actions (Apply/Message/Reveal) at the action point rather than the route level. After login, users return to the same page.

---

## Current State Analysis

| Component | Current Behavior | Problem |
|-----------|-----------------|---------|
| `/job-board` route | Wrapped in `RouteGuard requiredRole="professional"` | Forces login before browsing |
| `QuickApplyButton` | Shows toast "Please log in to apply" | No redirect, poor UX |
| `JobListingCard` | Has `previewMode` prop | Already partially implemented |
| Auth flow | `RouteGuard` encodes `redirect` param | Works for route-level gating |
| QueryClient | Two instances (main.tsx + App.tsx) | Inconsistent state, must fix |

---

## Implementation Plan

### Phase 1: Create `useAuthGate` Hook (Shared Utility)

**New file:** `src/hooks/useAuthGate.ts`

```typescript
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type GateOptions = {
  requiredRole?: "professional" | "client" | "admin";
  reason?: string;
};

export function useAuthGate() {
  const navigate = useNavigate();
  const location = useLocation();

  return function gate(
    user: any,
    activeRole?: string | null,
    opts?: GateOptions
  ): boolean {
    const redirect = encodeURIComponent(location.pathname + location.search);

    // Not logged in → redirect to auth
    if (!user) {
      if (opts?.reason) toast.error(opts.reason);
      navigate(`/auth?redirect=${redirect}`);
      return false;
    }

    // Logged in but wrong role → redirect to role switcher
    if (opts?.requiredRole && activeRole && activeRole !== opts.requiredRole) {
      toast.error(`Switch to ${opts.requiredRole} mode to continue`);
      navigate(`/role-switcher?redirect=${redirect}&requiredRole=${opts.requiredRole}`);
      return false;
    }

    return true;
  };
}
```

**Benefits:**
- One consistent behavior for all gated actions
- Preserves current URL for return after auth
- Handles role switching requirement
- Reusable across Apply/Message/Reveal/Post buttons

---

### Phase 2: Make `/job-board` Route Public

**File:** `src/App.tsx` (line ~358-362)

**Before:**
```typescript
<Route path="/job-board" element={
  <RouteGuard requiredRole="professional">
    <JobBoardPage />
  </RouteGuard>
} />
```

**After:**
```typescript
<Route path="/job-board" element={<JobBoardPage />} />
```

This allows anyone to browse the job board, while actions remain gated via component logic.

---

### Phase 3: Update `QuickApplyButton` to Use Auth Gate

**File:** `src/components/marketplace/QuickApplyButton.tsx`

**Changes:**
1. Import and use `useAuthGate`
2. Gate BEFORE opening dialog (better UX)
3. Gate again before submit (belt-and-suspenders)

```typescript
import { useAuthGate } from "@/hooks/useAuthGate";

export const QuickApplyButton: React.FC<QuickApplyButtonProps> = ({
  jobId,
  jobTitle,
  suggestedQuote,
  onSuccess,
  variant = 'default',
  size = 'default',
  className
}) => {
  const { user, profile } = useAuth();
  const gate = useAuthGate();
  const [open, setOpen] = useState(false);
  // ... existing state

  const handleOpenDialog = () => {
    // Gate: require login + professional role to open dialog
    const canProceed = gate(user, profile?.active_role, {
      requiredRole: "professional",
      reason: "Sign in as a professional to apply for jobs",
    });
    if (!canProceed) return;
    
    setOpen(true);
  };

  const handleQuickApply = async () => {
    // Double-check auth (handles expired sessions)
    const canProceed = gate(user, profile?.active_role, {
      requiredRole: "professional",
      reason: "Sign in as a professional to apply",
    });
    if (!canProceed) return;

    // ... existing apply logic
  };

  return (
    <>
      <Button onClick={handleOpenDialog} ...>
        Quick Apply
      </Button>
      {/* Dialog unchanged */}
    </>
  );
};
```

---

### Phase 4: Remove Duplicate QueryClientProvider

**File:** `src/App.tsx`

**Current (problematic):**
```typescript
const queryClient = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </HelmetProvider>
  );
}
```

**Fixed:**
```typescript
// REMOVE: const queryClient = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
      <AppContent />
    </HelmetProvider>
  );
}
```

The `QueryClientProvider` in `main.tsx` (line 57-58) is the correct single source of truth with proper configuration (staleTime, gcTime, retry logic).

---

### Phase 5: Update `JobsMarketplace` for Public Access

**File:** `src/components/marketplace/JobsMarketplace.tsx`

The component already supports `previewMode` for cards. Ensure:
1. When user is NOT authenticated, cards render with `previewMode={true}`
2. When user IS authenticated as professional, cards render with `previewMode={false}`

```typescript
// In the job card render:
<JobListingCard
  key={job.id}
  job={job}
  viewMode={viewMode}
  previewMode={!user || profile?.active_role !== 'professional'}
  onSendOffer={handleSendOffer}
  onMessage={handleMessage}
/>
```

---

### Phase 6: Add Message/Contact Gating

Apply the same `useAuthGate` pattern to any other action buttons:

**Components to update:**
- `JobListingCard` - "Message" button handler
- `JobDetailsModal` - "Apply" and "Message" buttons
- `ProfessionalCard` - "Contact" button (if applicable)

**Pattern:**
```typescript
const gate = useAuthGate();

const handleMessage = () => {
  const canProceed = gate(user, profile?.active_role, {
    requiredRole: "professional",
    reason: "Sign in as a professional to message clients",
  });
  if (!canProceed) return;
  
  // Proceed with messaging...
  onMessage?.(job.id);
};
```

---

### Phase 7: Add Preview CTA in Cards

**File:** `src/components/marketplace/JobListingCard.tsx`

When `previewMode` is true and buttons are hidden, show an encouraging CTA:

```typescript
{previewMode && (
  <div className="text-center p-2 bg-muted/50 rounded-md">
    <p className="text-sm text-muted-foreground">
      <span className="font-medium text-primary">Sign in as a professional</span>{' '}
      to apply for this job
    </p>
  </div>
)}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useAuthGate.ts` | NEW: Create shared auth gate hook |
| `src/App.tsx` | Remove RouteGuard from /job-board, remove duplicate QueryClient |
| `src/components/marketplace/QuickApplyButton.tsx` | Use useAuthGate instead of toast |
| `src/components/marketplace/JobsMarketplace.tsx` | Pass previewMode based on auth state |
| `src/components/marketplace/JobListingCard.tsx` | Add CTA for preview mode |
| `src/components/marketplace/JobDetailsModal.tsx` | Gate Apply/Message buttons |

---

## Implementation Order

1. **Create `useAuthGate` hook** - Foundation for all gating
2. **Remove duplicate QueryClientProvider** - Critical cleanup
3. **Remove RouteGuard from `/job-board`** - Make route public
4. **Update `QuickApplyButton`** - Gate at action point
5. **Update `JobsMarketplace`** - Pass previewMode correctly
6. **Update `JobListingCard`** - Add preview CTA
7. **Update `JobDetailsModal`** - Gate modal actions
8. **Test** - Verify flow in incognito

---

## Expected Behavior After Implementation

| User State | See Job Board | See Job Cards | Click Apply | Result |
|------------|--------------|---------------|-------------|--------|
| Logged out | ✅ Yes | ✅ Preview mode | Button visible | Redirects to `/auth?redirect=/job-board` |
| Logged in as Client | ✅ Yes | ✅ Preview mode | Button hidden | Shows "Sign in as professional" CTA |
| Logged in as Professional | ✅ Yes | ✅ Full mode | Button works | Opens apply dialog |

---

## Security Notes

1. **No client data exposure** - `previewMode` and `public_jobs_preview` view ensure no leakage
2. **Action-level gating** - Even if button is somehow clicked, backend RLS protects data
3. **Role verification** - Both frontend (`useAuthGate`) and backend (RLS policies on `job_quotes`) enforce professional role

---

## QA Checklist

- [ ] Open `/job-board` in incognito - jobs visible
- [ ] Click "Quick Apply" when logged out - redirects to `/auth?redirect=/job-board`
- [ ] Complete login - returns to `/job-board`
- [ ] Click "Quick Apply" as professional - dialog opens
- [ ] Submit application - works correctly
- [ ] Switch to client role - Apply buttons hidden, CTA shown
- [ ] Build version visible in footer (from previous fix)
- [ ] No console errors about missing QueryClient
