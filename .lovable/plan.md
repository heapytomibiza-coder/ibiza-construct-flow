
# Plan: Add DB Verification Queries to LAUNCH_RAIL.md

## Summary
Update `docs/LAUNCH_RAIL.md` to include comprehensive DB verification queries for each of the 15 canonical routes, using the **actual table names** from your Supabase schema.

---

## Changes

### File: `docs/LAUNCH_RAIL.md`

Add a new **Section 10: DB Verification Queries** after the current Section 9 (Parking Lot).

This section will include:

1. **Standard Placeholders Reference**
   - `[USER_ID]` = the test user's UUID (from `auth.uid()`)
   - `[JOB_ID]` = a job created during testing
   - `[BOOKING_ID]` = a booking ID if applicable

2. **Per-Route Query Blocks** (15 total)

   Each route gets a structured block:
   ```markdown
   ### Route: `/example`
   **Expected UI:** Description
   **Expected DB:** R: table1 | W: table2
   
   **Verification Queries:**
   ```sql
   -- Query here
   ```
   ```

3. **Actual Table Names Used**

   Based on your schema analysis:
   | Purpose | Table Name |
   |---------|------------|
   | Job matching | `job_matches` |
   | Verification requests | `professional_verifications` |
   | Verification documents | `professional_documents` |
   | Professional services | `professional_services` |
   | User profiles | `profiles` |
   | Pro profiles | `professional_profiles` |
   | User roles | `user_roles` |
   | Jobs | `jobs` |

---

## Query Content by Route

### 1. `/` (Landing)
- No DB queries required

### 2. `/auth`
```sql
-- After signup: verify profile + roles created
SELECT id, display_name, onboarding_completed, active_role, intent_role 
FROM profiles WHERE id = '[USER_ID]';

SELECT role FROM user_roles WHERE user_id = '[USER_ID]';
```

### 3. `/auth/quick-start`
```sql
SELECT id, display_name, onboarding_completed, active_role
FROM profiles WHERE id = '[USER_ID]';
-- Expected: onboarding_completed = true after completion
```

### 4. `/dashboard/client`
```sql
SELECT id, title, status, created_at
FROM jobs WHERE client_id = '[USER_ID]'
ORDER BY created_at DESC LIMIT 10;
```

### 5. `/post`
```sql
-- After submit, job should exist
SELECT id, title, client_id, status, created_at
FROM jobs WHERE client_id = '[USER_ID]'
ORDER BY created_at DESC LIMIT 1;
```

### 6. `/post/success`
```sql
SELECT id, title, client_id, status, created_at
FROM jobs WHERE client_id = '[USER_ID]'
ORDER BY created_at DESC LIMIT 1;
-- Expected: status = 'draft' or 'published', client_id matches
```

### 7. `/jobs/:id`
```sql
SELECT id, title, description, client_id, status
FROM jobs WHERE id = '[JOB_ID]';

-- RLS test: run as different user, should return 0 rows or deny
```

### 8. `/jobs/:id/matches`
```sql
SELECT jm.id, jm.booking_id, jm.professional_id, jm.status
FROM job_matches jm
WHERE jm.booking_id = '[BOOKING_ID]'
ORDER BY jm.created_at DESC LIMIT 50;
```

### 9. `/onboarding/professional`
```sql
SELECT user_id, onboarding_phase, verification_status, 
       tagline, bio, experience_years, cover_image_url, updated_at
FROM professional_profiles WHERE user_id = '[USER_ID]';
```

### 10. `/professional/verification`
```sql
-- Pro profile phase check
SELECT onboarding_phase, verification_status
FROM professional_profiles WHERE user_id = '[USER_ID]';
-- Expected after upload: verification_pending/pending

-- Verification request
SELECT id, status, verification_method, created_at
FROM professional_verifications WHERE professional_id = '[USER_ID]'
ORDER BY created_at DESC LIMIT 1;

-- Uploaded documents
SELECT id, document_type, file_name, verification_status
FROM professional_documents WHERE professional_id = '[USER_ID]';
```

### 11. `/professional/service-setup`
```sql
-- Active services count
SELECT COUNT(*) AS active_services
FROM professional_services 
WHERE professional_id = '[USER_ID]' AND is_active = true;

-- Services detail
SELECT id, micro_service_id, is_active, pricing_structure
FROM professional_services WHERE professional_id = '[USER_ID]';

-- Phase check (should be 'complete' if active_services > 0)
SELECT onboarding_phase FROM professional_profiles 
WHERE user_id = '[USER_ID]';
```

### 12. `/dashboard/pro`
```sql
-- Pro profile status
SELECT onboarding_phase, verification_status
FROM professional_profiles WHERE user_id = '[USER_ID]';

-- Active services
SELECT COUNT(*) AS active_services
FROM professional_services 
WHERE professional_id = '[USER_ID]' AND is_active = true;

-- Matches (if shown on dashboard)
SELECT jm.*, b.title
FROM job_matches jm
JOIN bookings b ON jm.booking_id = b.id
WHERE jm.professional_id = '[USER_ID]'
ORDER BY jm.created_at DESC LIMIT 10;
```

### 13. `/job-board`
```sql
SELECT id, title, status, created_at
FROM jobs WHERE status IN ('open', 'published')
ORDER BY created_at DESC LIMIT 50;
```

### 14. `/settings/profile`
```sql
SELECT id, display_name, full_name, phone, location, 
       active_role, onboarding_completed
FROM profiles WHERE id = '[USER_ID]';

-- Role switch verification
SELECT active_role FROM profiles WHERE id = '[USER_ID]';
```

### 15. `/admin`
```sql
-- Verify admin role
SELECT role FROM user_roles WHERE user_id = '[USER_ID]';
-- Expected: includes 'admin'

-- 2FA status (if stored in profiles)
SELECT two_factor_enabled FROM profiles WHERE id = '[USER_ID]';
```

---

## Technical Details

### Document Structure Addition

The new section will be added as **Section 10** with the following format:

```markdown
## 10. DB Verification Queries

### Placeholders
- `[USER_ID]` = auth.uid() of test user
- `[JOB_ID]` = a job created during Journey A
- `[BOOKING_ID]` = a booking ID if applicable

### Verification Rules
1. **No writes on view**: Dashboards and detail pages should only READ
2. **Owner-only writes**: Only the resource owner should be able to UPDATE
3. **RLS enforcement**: Cross-user access should fail or return empty

### Route: `/auth`
[... queries ...]
```

### Files Changed

| File | Action |
|------|--------|
| `docs/LAUNCH_RAIL.md` | Add Section 10 with DB verification queries |

---

## Benefits

1. **Diagnosable failures** — Every route has specific queries to verify behavior
2. **RLS testing** — Queries include cross-user access checks
3. **Phase verification** — Confirms `onboarding_phase` transitions correctly
4. **Actual table names** — Uses `job_matches`, `professional_services`, `professional_verifications`, `professional_documents`
