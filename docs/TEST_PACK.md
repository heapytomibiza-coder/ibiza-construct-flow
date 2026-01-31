# Test Pack: Canonical Journeys

> **Purpose**: Acceptance test suite proving the app matches the logic spec.
> **Created**: 2026-01-31
> **Coverage**: 20 scripted paths + 6 Release Gate tests
> **Evidence**: Proof artifacts in [EVIDENCE_APPENDIX.md](./EVIDENCE_APPENDIX.md)

---

## ⚠️ Release Gates (Non-Negotiable)

These 6 tests must pass before any release. They catch the most common recurring bugs.

| # | Gate | Test | Must NOT Happen |
|---|------|------|-----------------|
| 1 | `/job-board` logged out browsable | Anonymous → `/job-board` loads | ❌ Redirect to `/auth` |
| 2 | Onboarding step resumes correctly | Refresh mid-onboarding | ❌ Reset to `not_started` |
| 3 | Edit profile does not restart onboarding | Verified pro edits display name | ❌ Redirect to onboarding |
| 4 | Role switching persists | Switch role → Refresh | ❌ Role reverts |
| 5 | Public preview never calls private endpoints | Anon on `/job-board` | ❌ GET /rest/v1/jobs (private table) |
| 6 | Conversation uniqueness survives race | Rapid double-click "Message" | ❌ 2+ conversations created |

**See detailed proofs:** [EVIDENCE_APPENDIX.md § Release Gate Proofs](./EVIDENCE_APPENDIX.md#6-release-gate-proofs)

---

## Test Environment Setup

### Canonical User States (from Launch Rail)

| State | Description | DB Conditions |
|-------|-------------|---------------|
| S1 | Unauthenticated visitor | No session |
| S2 | Authenticated client (no jobs) | `user_roles` has `client` |
| S3 | Client with active jobs | Jobs in `draft`/`published` status |
| S4 | Professional (pending verification) | `verification_status = 'pending'` |
| S5 | Professional (verified, no services) | `verification_status = 'verified'`, no services |
| S6 | Professional (complete) | `onboarding_phase = 'complete'` |
| S7 | Professional (dual-role, active as client) | Has both roles, `active_role = 'client'` |
| S8 | Professional (dual-role, active as pro) | Has both roles, `active_role = 'professional'` |
| S9 | Admin (no 2FA) | Has `admin` role, no 2FA configured |
| S10 | Admin (2FA complete) | Has `admin` role + 2FA configured |

---

## Client Journeys

### C1: Visitor Browses Job Board Without Login ✅ (RELEASE GATE #1)

**State:** S1 (Unauthenticated)  
**Route:** `/job-board`

| Step | Action | Expected Result | Proof |
|------|--------|-----------------|-------|
| 1 | Navigate to `/job-board` | Page loads with job listings | No redirect to `/auth` |
| 2 | Verify network calls | `GET /rest/v1/public_jobs_preview` → 200 | No 401/403 errors |
| 3 | Check job card content | Shows: title, teaser, area, budget | No: client_id, exact address, attachments |
| 4 | Click "Apply" button | Toast: "Sign in as a professional to apply" → Redirect to `/auth` | `useAuthGate` triggered |

**Pass Criteria:** Job board is fully browsable without authentication.

**Required Proof Artifacts:**
1. **Screenshot/Video**: Direct visit to `/job-board` logged out, no redirect
2. **Network Panel**: `GET /rest/v1/public_jobs_preview` = 200, no calls to `jobs` or `profiles`
3. **Console Logs**: No `🔒 [RouteGuard]` logs on `/job-board` (page is not wrapped)

**Must NOT Happen:**
- ❌ Redirect to `/auth` on page load
- ❌ Query to `jobs` table from anonymous context
- ❌ Any 401/42501 errors
- ❌ RouteGuard wrapping of `/job-board`

---

### C2: Client Registers and Creates First Job

**State:** S1 → S2 → S3  
**Route:** `/auth` → `/dashboard` → `/jobs/new`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Sign up with email | Verification email sent |
| 2 | Click email link | Redirected to `/auth/callback` → `/dashboard` |
| 3 | Verify role assignment | `user_roles` contains `client` |
| 4 | Navigate to job wizard | Complete form |
| 5 | Submit job | Job created in `draft` status |
| 6 | Publish job | Status → `published`, `is_publicly_listed = true` |

**DB Proof:**
```sql
SELECT id, status, is_publicly_listed FROM jobs WHERE client_id = 'USER_ID';
```

---

### C3: Client Edits Job After Publishing

**State:** S3  
**Route:** `/jobs/:id/edit`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open published job | Edit form loads |
| 2 | Try to edit title | ❌ Field disabled (or limited) |
| 3 | Try to edit description | ✅ Allowed |
| 4 | Save changes | Job updated without status change |

**Invariant:** Published jobs have limited edit capability.

---

### C4: Client Starts Conversation with Professional

**State:** S3  
**Route:** `/job-board` → `/messages`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View professional profile | "Message" button visible |
| 2 | Click "Message" | Conversation created or existing returned |
| 3 | Send message | Message appears in thread |
| 4 | Double-click "Message" | No duplicate conversation created |

**DB Proof:**
```sql
SELECT COUNT(*) FROM conversations 
WHERE client_id = 'CLIENT_ID' AND professional_id = 'PRO_ID' AND job_id = 'JOB_ID';
-- Should return 1
```

---

### C5: Client Accepts Quote and Triggers Escrow

**State:** S3 (with quote received)  
**Route:** `/jobs/:id` → `/payments`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View received quote | Quote details displayed |
| 2 | Click "Accept Quote" | Payment flow initiated |
| 3 | Complete payment | Escrow funded |
| 4 | Verify job status | `in_progress` |

---

### C6: Client Completes Job and Leaves Review

**State:** S3 (job in_progress)  
**Route:** `/jobs/:id` → `/reviews`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Mark job as complete | Confirmation dialog |
| 2 | Submit review | Review saved |
| 3 | Verify job status | `completed` |

---

## Professional Journeys

### P1: Professional Signs Up and Sees Correct Onboarding Step

**State:** S4 → S5  
**Route:** `/auth` → `/onboarding/professional`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Sign up with "professional" intent | Redirected to `/onboarding/professional` |
| 2 | Complete intro form | Phase → `intro_submitted` |
| 3 | Refresh page | Still on intro (not reset to start) |
| 4 | Submit verification | Phase → `verification_pending` |

**DB Proof:**
```sql
SELECT onboarding_phase, verification_status 
FROM professional_profiles WHERE user_id = 'USER_ID';
```

---

### P2: Professional Completes Onboarding

**State:** S5 → S6  
**Route:** `/professional/service-setup` → `/dashboard`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Configure services | At least 1 service saved |
| 2 | Complete wizard | Phase → `complete` |
| 3 | Navigate to dashboard | Full dashboard access |

**Invariant:** Completion requires ≥1 active service in DB.

**DB Proof:**
```sql
SELECT COUNT(*) FROM professional_services 
WHERE professional_id = 'USER_ID' AND is_active = true;
-- Must be ≥ 1
```

---

### P3: Professional Views Job Board (Full Details)

**State:** S6 (verified pro)  
**Route:** `/job-board`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/job-board` | Page loads |
| 2 | Verify network calls | `GET /rest/v1/jobs` (not preview) → 200 |
| 3 | Check job card content | Shows full details including description |
| 4 | Click job | Full job detail page with "Apply" button enabled |

---

### P4: Professional Applies to Job

**State:** S6  
**Route:** `/job-board/:id` → `/applications`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Apply" | Application form opens |
| 2 | Submit quote | Application created |
| 3 | Verify in dashboard | Application visible in "My Applications" |

---

### P5: Professional Messages Client

**State:** S6  
**Route:** `/messages`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open conversation | Previous messages load |
| 2 | Send message | Message delivered |
| 3 | Verify realtime | Client sees message immediately |

---

## Admin Journeys

### A1: Admin Verifies Professional

**State:** S10 (Admin with 2FA)  
**Route:** `/admin/verifications`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View pending verifications | List of pending pros |
| 2 | Click "Approve" | `verification_status` → `verified` |
| 3 | Verify pro state | Professional can access dashboard |

**DB Proof:**
```sql
SELECT verification_status FROM professional_profiles WHERE user_id = 'PRO_ID';
-- Should be 'verified'
```

---

### A2: Admin Hides Job from Public

**State:** S10  
**Route:** `/admin/jobs`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find published job | Job visible |
| 2 | Click "Hide" | `is_publicly_listed` → `false` |
| 3 | Check public preview | Job not visible on `/job-board` |

---

### A3: Admin Without 2FA Blocked

**State:** S9 (Admin, no 2FA)  
**Route:** `/admin/dashboard`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to admin area | Redirected to 2FA setup |
| 2 | Toast message | "Two-Factor Authentication Required" |

---

## Cross-Role Journeys

### X1: Dual-Role User Switches Between Modes

**State:** S7 ↔ S8  
**Route:** `/dashboard`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start as client mode | Dashboard shows client UI |
| 2 | Click role switcher | Modal/dropdown appears |
| 3 | Select "Professional" | `active_role` → `professional` |
| 4 | Dashboard refreshes | Professional UI shown |
| 5 | Navigation changes | Pro-specific menu items visible |

**DB Proof:**
```sql
SELECT active_role FROM profiles WHERE id = 'USER_ID';
```

---

### X2: Role Switch Persists Across Tabs

**State:** S8  
**Route:** Multiple browser tabs

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open dashboard in Tab A | Professional mode |
| 2 | Open dashboard in Tab B | Professional mode (synced) |
| 3 | Switch to client in Tab A | Tab B updates (realtime) |

---

## Regression/Edge Cases

### E1: Deep Link to Job Board Logged Out

**State:** S1  
**Route:** Direct URL: `/job-board?filter=construction`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Paste URL in new browser | Page loads with jobs |
| 2 | Filter applied | Construction jobs shown |
| 3 | No auth prompt | Full browsing capability |

---

### E2: Refresh During Onboarding Doesn't Reset

**State:** S4 (mid-onboarding)  
**Route:** `/onboarding/professional`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Complete step 2 of onboarding | Phase updated |
| 2 | Refresh browser | Same step displayed |
| 3 | Verify phase | Not reset to `not_started` |

---

### E3: Double-Click Doesn't Create Duplicate Conversations

**State:** S3  
**Route:** `/professionals/:id`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Message" rapidly twice | Only 1 conversation created |
| 2 | Check database | Single row in `conversations` |

---

### E4: Edit Profile Continues Where Left Off

**State:** S6 (professional with partial profile)  
**Route:** `/settings/profile`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open profile settings | Form pre-filled with existing data |
| 2 | Update one field | Only that field changes |
| 3 | Navigate away and back | Changes persisted |

---

## Verification Checklist

Before release, all journeys must pass:

- [ ] C1-C6: Client journeys
- [ ] P1-P5: Professional journeys
- [ ] A1-A3: Admin journeys
- [ ] X1-X2: Cross-role journeys
- [ ] E1-E4: Edge cases

---

## Appendix: Network Proof Points

When verifying, capture these network calls:

| Journey | Expected Call | Expected Status |
|---------|---------------|-----------------|
| C1 | `GET /rest/v1/public_jobs_preview` | 200 |
| P3 | `GET /rest/v1/jobs` | 200 |
| C4 | `POST /rest/v1/conversations` | 201 or existing |
| Homepage | `GET /rest/v1/public_professionals_preview` | 200 |

**Red Flags (should never see on public routes):**
- 401 with error code 42501
- Redirect to `/auth` without user action
- `GET /rest/v1/profiles` with anon key
