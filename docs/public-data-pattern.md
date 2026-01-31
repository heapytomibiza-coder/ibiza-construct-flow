# Public Data Pattern

> Established: 2026-01-31  
> Context: Fixed 401/42501 errors on public pages caused by client-side joins to protected tables

## The Rule

**Public pages MUST NOT query protected tables directly or via client-side embeds.**

## What This Means

| ❌ Don't Do This | ✅ Do This Instead |
|------------------|-------------------|
| `.from('professional_profiles').select('..., profiles!fkey(...)')` | `.from('public_professionals_preview').select('...')` |
| Client-side joins to `profiles`, `user_roles`, etc. | Server-side view that joins and exposes safe columns |
| `security_invoker=on` for composite public views | Owner-executed view (default, no invoker flag) |
| Redirect to `/auth` on any 401 | Fail silently on public routes, gate only actions |

## Why This Matters

When a public page (like `/` or `/job-board`) makes a background request that hits a protected table:

1. Anonymous users get 401 / error code 42501 ("permission denied")
2. Global error handlers may interpret this as "user must sign in"
3. User experiences a sign-in prompt on a page that should be public
4. **Result**: "The site feels locked"

## The Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (public page)                                       │
│  ─────────────────────                                      │
│  .from('public_professionals_preview')                      │
│  .select('user_id, display_name, avatar_url, tagline, ...')│
│  → No joins, no protected table access                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE VIEW (owner-executed)                             │
│  ────────────────────────────                               │
│  CREATE VIEW public.public_professionals_preview AS         │
│  SELECT pp.user_id, pp.business_name, p.display_name, ...   │
│  FROM professional_profiles pp                              │
│  JOIN profiles p ON p.id = pp.user_id                       │
│  WHERE pp.is_active = true AND ...                          │
│                                                             │
│  GRANT SELECT ON ... TO anon, authenticated;                │
│  → View owner can read both tables                          │
│  → anon only has SELECT on the view, not base tables        │
└─────────────────────────────────────────────────────────────┘
```

## Current Public Views

| View | Purpose | Used By |
|------|---------|---------|
| `public_professionals_preview` | Featured professionals on homepage | `useFeaturedProfessionals` |
| `public_jobs_preview` | Job listings for anonymous users | `JobsMarketplace`, `LatestJobsSection` |

## Adding New Public Data

When you need to expose new joined data to public pages:

1. **Add columns to the view** (via migration), not to the client query
2. **No `security_invoker=on`** — the view must run as owner to read protected tables
3. **Grant SELECT to `anon, authenticated`** on the view only
4. **Update the client query** to select the new columns directly

## Regression Prevention

Each hook that queries public views should include this comment:

```typescript
// IMPORTANT: Do NOT join profiles from the client.
// Public pages must query public_professionals_preview to avoid 401/42501 on profiles.
// The view handles the join server-side with owner privileges.
```

## Testing Public Access

```sql
-- Verify anon can read the view
SET ROLE anon;
SELECT user_id, display_name FROM public.public_professionals_preview LIMIT 5;
RESET ROLE;

-- Verify anon CANNOT read base tables directly
SET ROLE anon;
SELECT id, display_name FROM public.profiles LIMIT 1; -- Should fail
RESET ROLE;
```

## Code Review Checklist (Public Pages)

Before approving changes to public pages:

- [ ] Does this page query a `public_*` view only?
- [ ] Are there any client-side joins to protected tables?
- [ ] Does the view expose only whitelisted columns?
- [ ] Are 401s on this route handled without redirecting to `/auth`?

---

## Related Files

- `src/hooks/useFeaturedProfessionals.ts` — exemplar implementation
- `src/lib/jobs/dataSource.ts` — job data source selector
- `supabase/migrations/*_public_professionals_preview*` — view definitions
