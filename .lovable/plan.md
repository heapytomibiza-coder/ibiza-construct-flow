

# Fix Authentication & Email Delivery

## Summary

Your account is already verified and ready to use. The "verification email" issue is a red herring — the real problem is a password mismatch. Here's the complete fix:

---

## Part 1: Sign In with Existing Account (Immediate)

Your account status in the database:

| Field | Value |
|-------|-------|
| Email | `heapymagic@googlemail.com` |
| Verified | ✅ Nov 20, 2025 |
| Roles | `client`, `professional` |

**The "Invalid login credentials" error means the password is wrong**, not that the account isn't verified.

### Solution: Reset Password

1. Navigate to `/auth/forgot-password`
2. Enter `heapymagic@googlemail.com`
3. Check inbox (and spam) for reset link
4. Set new password → sign in

---

## Part 2: Enable Auto-Confirm for Development

This prevents email verification requirement during testing.

### Database Changes

No database changes needed — this is a Supabase Auth configuration.

### Code Change

Use the configure-auth tool to enable auto-confirm:

```text
Setting: Auto-confirm email signups = true
```

This means new signups will be immediately verified without email confirmation.

---

## Part 3: Fix Email Delivery with Resend

### Current Problem

The `send-email` edge function uses Resend's test domain:

```typescript
from: "Lovable <onboarding@resend.dev>"  // Test domain - unreliable
```

**Note:** Supabase Auth emails (signup verification, password reset) use Supabase's built-in SMTP, not your edge function. For production, you'd configure a custom SMTP in the Supabase dashboard.

### Fix for Edge Function Emails

Update all edge functions to use a verified domain. This requires:

1. **Resend Dashboard**: Verify your domain at https://resend.com/domains
2. **Update Edge Functions**: Change `from` addresses

### Files to Update

| File | Current `from` | New `from` |
|------|----------------|------------|
| `supabase/functions/send-email/index.ts` | `onboarding@resend.dev` | `noreply@yourdomain.com` |
| `supabase/functions/send-booking-reminder/index.ts` | `reminders@ibiza.app` | Keep (if domain verified) |
| `supabase/functions/send-message-notification/index.ts` | `notifications@ibiza.app` | Keep (if domain verified) |
| `supabase/functions/send-payment-reminder/index.ts` | `noreply@yourdomain.com` | Update to real domain |
| `supabase/functions/send-booking-reminders/index.ts` | `notifications@yourdomain.com` | Update to real domain |

### Recommended Approach

If you have a verified domain (e.g., `ibiza.app`), update all `from` addresses to use it:

```typescript
// Standardized sender for all emails
from: "Ibiza Construct <noreply@ibiza.app>"
```

---

## Implementation Order

```text
┌─────────────────────────────────────────────┐
│ Step 1: Reset password (immediate access)   │
│         → /auth/forgot-password             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Step 2: Enable auto-confirm for dev         │
│         → Configure auth setting            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Step 3: (Optional) Fix Resend domain        │
│         → Verify domain in Resend dashboard │
│         → Update edge function `from` fields│
└─────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Change |
|------|--------|
| Auth config | Enable `autoconfirm` for email signups |
| `supabase/functions/send-email/index.ts` | Update `from` address (line 363) |
| `supabase/functions/send-payment-reminder/index.ts` | Update `from` address (line 109) |
| `supabase/functions/send-booking-reminders/index.ts` | Update `from` address (line 59) |

---

## Testing After Implementation

- [ ] Request password reset for `heapymagic@googlemail.com`
- [ ] Check email arrives (spam folder too)
- [ ] Reset password and sign in
- [ ] Verify role switcher appears (both client and professional roles)
- [ ] Test new signup flow with auto-confirm enabled

