

# Critical Refinements: Public Job Board Privacy & Security Fixes

## Summary of Issues Found

Based on detailed analysis of the current implementation, here are the critical bugs that need fixing:

| Issue | Location | Severity | Impact |
|-------|----------|----------|--------|
| **Missing activeRole blocks wrong users** | `useAuthGate.ts` | 🔴 CRITICAL | Clients can slip through before role loads |
| **Hero image leaks photos in preview** | `JobListingCard.tsx` | 🔴 CRITICAL | Client photos visible publicly |
| **hasPhotos logic wrong in preview** | `JobListingCard.tsx` | 🟡 MEDIUM | Filter/featured logic fails |
| **Duplicate useEffect** | `JobsMarketplace.tsx` | 🟡 MEDIUM | Double queries, race conditions |
| **previewMode based on !user only** | `JobsMarketplace.tsx` | 🔴 CRITICAL | Logged-in clients see full mode |
| **Filters use answers.extras.photos** | `JobsMarketplace.tsx` | 🟡 MEDIUM | Photos filter fails in preview |
| **handleSendOffer queries DB per click** | `JobsMarketplace.tsx` | 🟡 MEDIUM | Slow, no redirect |
| **Modal leaks photos/address/answers** | `JobDetailsModal.tsx` | 🔴 CRITICAL | All private data exposed |
| **No preview CTA in compact mode** | `JobListingCard.tsx` | 🟢 LOW | Poor UX for anonymous users |

---

## Implementation Plan

### Phase 1: Fix `useAuthGate.ts` - Block Missing Role

**Problem:** Current logic only blocks if `activeRole !== requiredRole`, but if `activeRole` is `null/undefined`, users slip through.

**Current (buggy):**
```typescript
if (opts?.requiredRole && activeRole && activeRole !== opts.requiredRole) {
```

**Fixed:**
```typescript
if (opts?.requiredRole) {
  if (!activeRole) {
    toast.error(`Switch to ${opts.requiredRole} mode to continue`);
    navigate(`/role-switcher?redirect=${redirect}&requiredRole=${opts.requiredRole}`);
    return false;
  }
  if (activeRole !== opts.requiredRole) {
    toast.error(`Switch to ${opts.requiredRole} mode to continue`);
    navigate(`/role-switcher?redirect=${redirect}&requiredRole=${opts.requiredRole}`);
    return false;
  }
}
```

This makes the gate deterministic - it blocks until role is confirmed.

---

### Phase 2: Fix `JobListingCard.tsx` - Privacy & Logic Bugs

**Bug 1: Hero image can leak real client photos in preview mode**

Current code:
```typescript
const heroImage = job.answers?.extras?.photos?.[0] || serviceVisuals.hero;
```

This shows real photos even if previewMode is true.

**Fix:**
```typescript
// Never show client-uploaded photos in preview mode (privacy)
const photoCount = previewMode ? 0 : (job.answers?.extras?.photos?.length || 0);

const heroImage = previewMode
  ? serviceVisuals.hero
  : (job.answers?.extras?.photos?.[0] || serviceVisuals.hero);
```

**Bug 2: hasPhotos logic is inconsistent**

Current code mixes `job.has_photos` and `photoCount`:
```typescript
const hasPhotos = job.has_photos || photoCount > 0;
```

**Fix:**
```typescript
// Preview mode uses explicit boolean flag from public view
const hasPhotos = previewMode
  ? !!job.has_photos
  : photoCount > 0;
```

**Bug 3: Compact mode shows no CTA**

Add CTA in compact mode when previewMode is true:
```typescript
{!previewMode ? (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" onClick={() => onSendOffer?.(job.id)}>
      Send Offer
    </Button>
  </div>
) : (
  <div className="text-xs text-muted-foreground text-right">
    Sign in as a professional to apply
  </div>
)}
```

---

### Phase 3: Fix `JobsMarketplace.tsx` - Multiple Bugs

**Bug 1: Duplicate useEffect causes double queries**

Current code has TWO identical effects:
```typescript
useEffect(() => { loadJobs(); }, [sortBy]);
useEffect(() => { loadJobs(); }, [sortBy]);
```

**Fix:** Delete one, add `previewMode` to dependencies.

**Bug 2: previewMode only checks `!user` (wrong)**

Current:
```typescript
previewMode={!user}
```

This means logged-in clients see full mode incorrectly.

**Fix:** Add role-based previewMode:
```typescript
const isProfessional = !!user && profile?.active_role === 'professional';
const previewMode = !isProfessional;
```

Then pass:
```typescript
previewMode={previewMode}
```

**Bug 3: loadJobs branches on `!user` instead of `previewMode`**

The authenticated branch loads full data even for clients.

**Fix:** Change condition from `if (!user)` to `if (previewMode)`.

**Bug 4: Filters use `job.answers?.extras?.photos` in preview mode**

Current:
```typescript
const hasPhotos = job.answers?.extras?.photos?.length > 0;
```

In preview mode, `answers` is `undefined`, so this always returns `false`.

**Fix:** Add helper:
```typescript
const jobHasPhotos = (job: any) =>
  previewMode ? !!job.has_photos : (job.answers?.extras?.photos?.length ?? 0) > 0;
```

**Bug 5: handleSendOffer queries DB per click**

Current code does a `supabase.from('user_roles')` query on every click.

**Fix:** Use `useAuthGate` instead:
```typescript
const gate = useAuthGate();

const handleSendOffer = (jobId: string) => {
  const ok = gate(user, profile?.active_role, {
    requiredRole: 'professional',
    reason: 'Sign in as a professional to send offers',
  });
  if (!ok) return;
  
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;
  setSelectedJobForOffer({ jobId, jobTitle: job.title });
};
```

Same for `handleMessageClient`:
```typescript
const handleMessageClient = (jobId: string) => {
  const ok = gate(user, profile?.active_role, {
    requiredRole: 'professional',
    reason: 'Sign in as a professional to message clients',
  });
  if (!ok) return;
  
  const job = jobs.find(j => j.id === jobId);
  if (!job?.client_id) {
    toast.error('Unable to start conversation');
    return;
  }
  navigate(`/messages?professional=${job.client_id}`);
};
```

---

### Phase 4: Fix `JobDetailsModal.tsx` - Privacy Leaks

This modal currently leaks ALL private data if opened from the public job board.

**Add `previewMode` prop:**
```typescript
interface JobDetailsModalProps {
  // ... existing props
  previewMode?: boolean;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  // ... existing
  previewMode = false,
}) => {
```

**Pass from JobListingCard:**
```typescript
<JobDetailsModal
  job={job}
  open={showDetailsModal}
  onClose={() => setShowDetailsModal(false)}
  onApply={onSendOffer}
  onMessage={onMessage}
  previewMode={previewMode}
/>
```

**Fix 1: Block photo gallery in preview mode**

Current:
```typescript
{hasPhotos && <JobPhotoGallery photos={extras.photos!} />}
```

Fixed:
```typescript
const hasPhotos = !previewMode && !!extras?.photos?.length;

{!previewMode && hasPhotos && (
  <JobPhotoGallery photos={extras.photos!} className="mb-0" />
)}
```

**Fix 2: Block address leak**

Current:
```typescript
{job.location.address && <p>{job.location.address}</p>}
```

Fixed:
```typescript
{!previewMode && job.location?.address && (
  <p className="text-sm text-muted-foreground">{job.location.address}</p>
)}
```

**Fix 3: Block entire Project Details accordion in preview mode**

Current:
```typescript
{(hasMicroAnswers || hasLogistics || hasSchedule || hasExtras) && ( ... )}
```

Fixed:
```typescript
{!previewMode && (hasMicroAnswers || hasLogistics || hasSchedule || hasExtras) && ( ... )}
```

**Fix 4: Show CTA instead of action buttons in preview mode**

Replace the action buttons section with conditional rendering:
```typescript
{previewMode ? (
  <div className="flex gap-3 sticky bottom-0 bg-background pt-4 pb-2">
    <Button variant="outline" onClick={onClose} className="flex-1">
      Close
    </Button>
    <div className="flex-1 text-center p-2 bg-muted/50 rounded-md flex items-center justify-center">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-primary">Sign in as a professional</span>{' '}
        to message or apply
      </p>
    </div>
  </div>
) : (
  /* existing action buttons */
)}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useAuthGate.ts` | Block missing activeRole |
| `src/components/marketplace/JobListingCard.tsx` | Fix heroImage leak, hasPhotos logic, add compact CTA |
| `src/components/marketplace/JobsMarketplace.tsx` | Fix previewMode logic, remove duplicate effect, use gate |
| `src/components/marketplace/JobDetailsModal.tsx` | Add previewMode, block photos/address/answers |

---

## Implementation Order

1. **Fix `useAuthGate.ts`** - Critical security fix
2. **Fix `JobListingCard.tsx`** - Privacy + logic bugs
3. **Fix `JobsMarketplace.tsx`** - Multiple bugs including duplicate effect
4. **Fix `JobDetailsModal.tsx`** - Add previewMode protection

---

## Expected Behavior After Fix

| Scenario | Job Cards | Photos | Address | Apply/Message |
|----------|-----------|--------|---------|---------------|
| Logged out | ✅ Preview | ❌ Hidden | ❌ Hidden | Redirects to auth |
| Client role | ✅ Preview | ❌ Hidden | ❌ Hidden | Shows CTA/redirects |
| Professional | ✅ Full | ✅ Visible | ✅ Visible | ✅ Works |

---

## Security Benefits

1. **No photo leakage** - Hero images always use category fallback in preview
2. **No address leakage** - Modal hides address in preview mode
3. **No answers leakage** - Entire Project Details section hidden
4. **Deterministic gate** - Missing role now blocks (doesn't slip through)
5. **Consistent behavior** - Same preview logic on homepage AND job board
6. **Role-based, not auth-based** - Clients also see preview mode

---

## QA Checklist

- [ ] Incognito → `/job-board` shows jobs with category hero images only
- [ ] Incognito → Click "View Details" → Modal shows no photos/address/answers
- [ ] Incognito → Click "Apply" → Redirects to `/auth?redirect=...`
- [ ] Login as Client → Still sees preview mode (not full data)
- [ ] Login as Professional → Sees full data with real photos
- [ ] Hard refresh while role loading → Gate blocks until role confirmed
- [ ] Featured jobs filter works correctly using `has_photos` flag
- [ ] No console errors about missing data

