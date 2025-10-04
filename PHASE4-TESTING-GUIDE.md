# Phase 4: Testing & Validation Guide

## Overview
Complete end-to-end testing guide for the job board and subscription system.

## ✅ Test Scenarios

### 1. Job Posting Flow (Client Side)
**Prerequisites:** Logged in as a client

**Steps:**
1. Navigate to `/post`
2. Complete all 8 wizard steps:
   - Step 1: Select Main Category (e.g., "Construction")
   - Step 2: Select Subcategory (e.g., "Remodeling")
   - Step 3: Select Micro Service (e.g., "Kitchen Remodel")
   - Step 4: Answer service-specific questions
   - Step 5: Add location, timing, budget
   - Step 6: Upload photos (optional), add notes
   - Step 7: Review all details
   - Step 8: Submit job
3. Verify success toast appears
4. Verify redirect to dashboard
5. Check database: Job should appear in `jobs` table with `status = 'open'`

**Expected Results:**
- ✅ Job created in `jobs` table (not `bookings`)
- ✅ `notify-job-broadcast` edge function invoked
- ✅ Success toast displayed
- ✅ Redirect to dashboard

---

### 2. Professional Notification System
**Prerequisites:** 
- 1 job posted
- Multiple professional accounts with different tiers (basic, pro, premium)

**Test A: Premium Professional**
1. Sign in as premium professional
2. Within 30 seconds, notification should appear:
   - Toast notification: "🔔 New Job Available"
   - Notification bell icon shows badge (1)
3. Click notification bell
4. Verify notification details displayed
5. Click notification → redirects to `/marketplace?job={jobId}`

**Expected Results:**
- ✅ Instant notification (<30 seconds)
- ✅ Toast appears with job title
- ✅ Notification bell badge increments
- ✅ Click redirects to marketplace

**Test B: Pro Professional**
1. Sign in as pro professional
2. Notification should appear within 1 minute
3. Verify same notification behavior as premium

**Test C: Basic Professional**
1. Sign in as basic professional
2. NO instant notification
3. Navigate to marketplace manually
4. Job should NOT be visible (posted < 24 hours ago)

**Expected Results:**
- ❌ No notification for basic users
- ❌ Job hidden in marketplace (< 24hrs)

---

### 3. Subscription Tier Enforcement
**Test A: Basic User Job Visibility**
1. Post a job as client
2. Sign in as basic professional immediately
3. Navigate to `/marketplace`
4. Verify job is NOT visible in listings

**Wait 24 hours (or mock timestamp):**
5. Refresh marketplace
6. Verify job NOW appears in listings

**Test B: Pro User Job Visibility**
1. Post a job as client
2. Sign in as pro professional immediately
3. Navigate to `/marketplace`
4. Verify job IS visible in listings immediately

**Expected Results:**
- ✅ Basic: Jobs hidden until 24 hours old
- ✅ Pro/Premium: All jobs visible immediately

---

### 4. Subscription Upgrade Flow
**Prerequisites:** Logged in as basic professional

**Steps:**
1. Navigate to `/marketplace`
2. Verify upsell banner appears at top of page
3. Click "Upgrade to Pro - $29/mo" button
4. Should open Stripe Checkout in new tab
5. Complete test payment (use Stripe test card: `4242 4242 4242 4242`)
6. After successful payment, redirected to `/subscription-success`
7. Click "Browse Jobs" → marketplace should show all jobs
8. Check database: `professional_profiles.subscription_tier` should be `'pro'`

**Expected Results:**
- ✅ Stripe checkout opens
- ✅ Payment succeeds (test mode)
- ✅ Redirects to success page
- ✅ Subscription tier updated in database
- ✅ Job visibility updated immediately

---

### 5. Subscription Management
**Prerequisites:** Active pro or premium subscription

**Steps:**
1. Navigate to `/dashboard`
2. Find "Manage Subscription" button
3. Click button
4. Should open Stripe Customer Portal in new tab
5. In portal, verify:
   - Current subscription plan displayed
   - Can update payment method
   - Can cancel subscription
   - Can download invoices

**Expected Results:**
- ✅ Customer portal opens
- ✅ Subscription details shown
- ✅ Can manage subscription

---

### 6. Real-Time Notifications
**Test Setup:**
- Open browser in 2 tabs
- Tab A: Logged in as client
- Tab B: Logged in as premium professional

**Steps:**
1. In Tab A (client): Post a new job
2. In Tab B (professional): Watch for notification
3. Within 30 seconds, notification should appear in Tab B without refresh

**Expected Results:**
- ✅ Notification appears in Tab B automatically
- ✅ Toast notification displayed
- ✅ Notification bell badge updates
- ✅ No manual refresh required

---

### 7. Notification Bell Interaction
**Prerequisites:** Professional with unread notifications

**Steps:**
1. Click notification bell icon in header
2. Popover should open showing list of notifications
3. Unread notifications should have blue dot indicator
4. Click individual notification:
   - Should redirect to job
   - Notification marked as read
   - Blue dot removed
5. Click "Mark all read" button
6. All notifications should lose blue dot indicator

**Expected Results:**
- ✅ Popover displays notifications
- ✅ Unread count badge on bell icon
- ✅ Click navigates to job
- ✅ Notifications marked as read

---

### 8. Subscription Cancellation Flow
**Prerequisites:** Active subscription

**Steps:**
1. Open customer portal
2. Click "Cancel subscription"
3. Confirm cancellation
4. Verify subscription status updates
5. Check notification access (should continue until period end)
6. After period end, verify downgrade to basic tier

**Expected Results:**
- ✅ Subscription cancels
- ✅ Access continues until period end
- ✅ After end date, tier reverts to basic

---

## 🐛 Common Issues & Fixes

### Issue: Notifications not appearing
**Diagnosis:**
1. Check edge function logs: `supabase functions logs --functions notify-job-broadcast`
2. Verify realtime subscription in browser console
3. Check `notifications` table for inserted records

**Fix:**
- Ensure realtime is enabled: `ALTER PUBLICATION supabase_realtime ADD TABLE notifications;`
- Verify RLS policies allow inserts

### Issue: Jobs not visible in marketplace
**Diagnosis:**
1. Check `jobs` table: Verify `status = 'open'`
2. Check user's subscription tier in `professional_profiles`
3. Verify RLS policy: `can_professional_view_job()`

**Fix:**
- Ensure jobs inserted into `jobs` table (not `bookings`)
- Verify subscription tier calculation in `loadJobs()` function

### Issue: Stripe checkout fails
**Diagnosis:**
1. Check edge function logs: `supabase functions logs --functions create-checkout`
2. Verify Stripe secret key is set
3. Check browser console for CORS errors

**Fix:**
- Ensure `STRIPE_SECRET_KEY` secret is configured
- Verify CORS headers in edge function

---

## 📊 Success Metrics

### Phase 4 Complete When:
- ✅ All 8 test scenarios pass
- ✅ Job posting creates entries in `jobs` table
- ✅ Notifications deliver to correct tiers (<30s for premium)
- ✅ Subscription upgrades work end-to-end
- ✅ Customer portal accessible
- ✅ Real-time updates work across tabs
- ✅ No console errors during flows
- ✅ RLS policies prevent unauthorized access

---

## 🔧 Testing Utilities

### Create Test Professional Accounts
```sql
-- Create test professionals with different tiers
INSERT INTO professional_profiles (user_id, subscription_tier, is_active)
VALUES 
  ('user-id-1', 'basic', true),
  ('user-id-2', 'pro', true),
  ('user-id-3', 'premium', true);
```

### Simulate Old Job (for basic user testing)
```sql
-- Backdate a job to 25 hours ago
UPDATE jobs 
SET created_at = NOW() - INTERVAL '25 hours'
WHERE id = 'job-id';
```

### Check Notification Delivery
```sql
-- View all notifications for a user
SELECT * FROM notifications 
WHERE user_id = 'user-id' 
ORDER BY created_at DESC;
```

### View Job Broadcast Stats
```sql
-- Check broadcast metrics
SELECT 
  j.title,
  jb.professionals_notified,
  jb.target_criteria,
  jb.created_at
FROM job_broadcasts jb
JOIN jobs j ON j.id = jb.job_id
ORDER BY jb.created_at DESC;
```

---

## 🎯 Performance Targets

- Job creation: < 2 seconds
- Notification delivery: < 30 seconds (premium/pro)
- Marketplace load: < 1 second
- Stripe checkout open: < 3 seconds
- Subscription check: < 500ms

---

## ✅ Final Validation Checklist

- [ ] Job wizard completes without errors
- [ ] Jobs appear in marketplace (tier-appropriate)
- [ ] Notifications deliver to premium/pro users
- [ ] Basic users see jobs after 24 hours
- [ ] Subscription upgrade flow works
- [ ] Customer portal accessible
- [ ] Notification bell shows unread count
- [ ] Click notification navigates to job
- [ ] Real-time updates work across tabs
- [ ] No security vulnerabilities (RLS tested)
- [ ] Edge function logs show no errors
- [ ] Stripe webhooks log correctly (if enabled)
