# Database Security Snapshot
**Generated:** 2026-01-31
**Project:** CS Ibiza / Constructive Solutions

---

## 1. RLS Status Summary

### Tables with RLS Enabled
✅ **All 150+ public tables have RLS enabled**

Key tables status:
| Table | RLS Enabled | Force RLS |
|-------|-------------|-----------|
| profiles | ✅ | ❌ |
| user_roles | ✅ | ❌ |
| admin_roles | ✅ | ❌ |
| jobs | ✅ | ❌ |
| escrow_payments | ✅ | ❌ |
| escrow_transactions | ✅ | ❌ |
| payment_transactions | ✅ | ❌ |
| conversations | ✅ | ❌ |
| messages | ✅ | ❌ |

### Materialized Views (No RLS)
| View | Notes |
|------|-------|
| analytics_live_kpis | ✅ Safe - aggregates only, no PII |

---

## 2. Public Views (Security DEFINER)

| View | Owner | Security Mode | Purpose |
|------|-------|---------------|---------|
| public_jobs_preview | postgres | DEFINER | Anonymous job board access |
| public_professionals_preview | postgres | DEFINER | Anonymous pro listing |
| professional_profiles_public | postgres | DEFINER | Public pro profiles |
| services_catalog | postgres | DEFINER | Service catalog |
| currency_exchange_pairs | postgres | DEFINER | Exchange rates |
| pricing_variance_summary | postgres | DEFINER | Pricing analytics |
| legacy_booking_requests | postgres | DEFINER | Backward compatibility |

---

## 3. Critical RLS Policies

### Admin Tables (Super Admin Only)
```
admin_roles:
  - "Super admins manage admin_roles" → is_super_admin()
  - "Admins view admin_roles" → is_admin()
```

### User Data (Owner Only)
```
profiles:
  - "Users can view their own profile" → auth.uid() = id
  - "Users can update their own profile" → auth.uid() = id

user_roles:
  - "Users can view their own roles" → auth.uid() = user_id
  - "Super admins manage roles" → is_super_admin()
```

### Payment/Escrow (Service Role + Owner)
```
escrow_payments:
  - Owner can view their escrows
  - Service role for mutations
  
payment_transactions:
  - Owner can view their transactions
  - Service role for mutations
```

### Public Read Tables
```
achievements, blocked_dates, exchange_rates, feature_flags,
job_photos, leaderboard_entries, loyalty_tiers, micro_services,
portfolio_images, professional_availability, professional_reviews,
professional_stats, services
```

---

## 4. Security Functions

### SECURITY DEFINER Functions (Critical)
| Function | Args | Config |
|----------|------|--------|
| admin_assign_role | p_target_user_id, p_role | search_path=public |
| admin_revoke_role | p_target_user_id, p_role | search_path=public |
| approve_professional | _professional_id, _notes | search_path=public, pg_temp |
| apply_to_become_professional | - | search_path=public, pg_temp |
| is_admin | - | search_path=public |
| is_super_admin | - | search_path=public |
| has_role | _user_id, _role | search_path=public |
| get_effective_roles | - | search_path=public |
| get_refundable_amount | p_escrow_payment_id | search_path=public, pg_temp |
| cleanup_old_security_records | - | search_path=public, pg_temp |

---

## 5. Triggers on Core Tables

| Table | Trigger | Function | Timing |
|-------|---------|----------|--------|
| profiles | ensure_user_role_on_profile_trigger | ensure_user_role_on_profile | AFTER |
| profiles | update_profiles_updated_at | update_updated_at_column | BEFORE |
| user_roles | trg_log_user_roles_change | log_user_roles_change | AFTER |
| jobs | job_state_transition_trigger | log_job_state_transition | AFTER |
| jobs | track_job_status_changes | track_job_lifecycle | AFTER |
| messages | update_conversation_on_message | update_conversation_timestamp | AFTER |
| escrow_transactions | trg_update_refund_total | update_refund_total | AFTER |
| escrow_transactions | trigger_notify_payment_released | notify_payment_released | AFTER |
| professional_profiles | update_professional_profiles_updated_at | update_updated_at_column | BEFORE |

---

## 6. Database Constraints (Double-Spend Protection)

| Index | Table | Condition |
|-------|-------|-----------|
| escrow_one_active_per_job | escrow_payments | WHERE status IN ('pending','funded','processing') |
| escrow_one_release_per_payment | escrow_releases | WHERE status IN ('pending','completed') |
| escrow_one_release_transaction_per_milestone | escrow_transactions | WHERE type='release' AND status IN (...) |
| escrow_unique_payment_intent | escrow_payments | WHERE stripe_payment_intent_id IS NOT NULL |

---

## 7. Edge Functions (147 total)

### Payment Functions (Hardened)
- confirm-payment
- create-checkout-session
- create-escrow-payment
- create-job-payment
- create-payment-intent
- create-payment-refund
- fund-escrow
- process-escrow-release
- refund-escrow
- release-escrow
- simple-release-escrow
- stripe-webhook
- verify-payment

### Admin Functions (Hardened)
- admin-edit-job-version
- admin-manage-roles
- admin-profile-moderate
- admin-service-upsert
- admin-verify

### AI Functions (Rate Limited)
- ai-chatbot
- ai-professional-matcher
- ai-price-validator
- ai-recommendation-engine
- ai-risk-analyzer
- ai-smart-matcher

---

## 8. Scheduled Jobs

| Job | Schedule | Function |
|-----|----------|----------|
| cleanup_old_security_records_daily | 30 3 * * * | cleanup_old_security_records() |

---

## 9. Proof Queries for Debugging

### User Auth State
```sql
SELECT 
  p.id,
  p.email,
  p.active_role,
  p.onboarding_phase,
  p.is_verified,
  array_agg(ur.role) as roles
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.id = 'USER_ID_HERE'
GROUP BY p.id;
```

### Admin Status Check
```sql
SELECT 
  ar.user_id,
  ar.role,
  ar.granted_at,
  p.email
FROM admin_roles ar
JOIN profiles p ON p.id = ar.user_id
WHERE ar.user_id = 'USER_ID_HERE';
```

### Escrow State
```sql
SELECT 
  ep.id,
  ep.job_id,
  ep.escrow_status,
  ep.amount,
  ep.total_refunded_amount,
  ep.stripe_payment_intent_id
FROM escrow_payments ep
WHERE ep.job_id = 'JOB_ID_HERE';
```

### RLS Policy Test
```sql
-- As specific user (run with their JWT)
SELECT * FROM jobs WHERE id = 'JOB_ID_HERE';

-- Check what RLS would allow
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'jobs';
```

---

## 10. Bug Pack Template

When reporting auth/gating issues, include:

```markdown
## Bug Pack: [Issue Title]
**Date:** YYYY-MM-DD
**Reporter:** [Name]

### Repro Steps
1. Navigate to [URL]
2. [Action]
3. [Action]
4. Observe: [Actual behavior]

### Expected vs Actual
- **Expected:** [What should happen]
- **Actual:** [What happens]

### Console Logs
```
[Paste filtered RouteGuard/Auth/Onboarding logs]
```

### Network Request
- **URL:** [Request URL]
- **Status:** [Status code]
- **Response:** [Body or error]

### Proof Query Output
**Affected User:**
| Field | Value |
|-------|-------|
| user_id | ... |
| active_role | ... |
| roles | ... |
| onboarding_phase | ... |

**Known-Good User:**
| Field | Value |
|-------|-------|
| user_id | ... |
| active_role | ... |
| roles | ... |
| onboarding_phase | ... |
```

---

## 11. Super Admin

| User ID | Role | Granted |
|---------|------|---------|
| cbd937d2-240b-421d-9499-653e4a994f74 | super_admin | 2026-01-26 |

---

## 12. Known Low-Priority Warnings (13 total)

- `search_path` warnings on non-SECURITY DEFINER functions (3)
- Materialized view in API (1) - safe, aggregates only
- RLS always-true on service_role policies (9) - intentional for system operations

These are **not exploitable** and can be addressed during compliance prep.
