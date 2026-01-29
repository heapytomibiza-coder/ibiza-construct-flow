

# Fix: Create Missing `cover-photos` Storage Bucket

## Problem

The "Submit for verification" button on the professional onboarding page fails with:

```
StorageApiError: Bucket not found
```

The `ProfessionalOnboardingPage.tsx` tries to upload cover images to a storage bucket called `cover-photos`, but **this bucket was never created**.

## Root Cause

Looking at the code:
- `src/pages/ProfessionalOnboardingPage.tsx` uploads to `supabase.storage.from('cover-photos')`
- Other buckets like `service-images` were created via SQL migration
- The `cover-photos` bucket was never created

## Solution

Create the missing storage bucket with appropriate RLS policies via database migration.

---

## Technical Implementation

### Database Migration

Create the `cover-photos` bucket following the same pattern as `service-images`:

```sql
-- Create storage bucket for professional cover photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cover-photos',
  'cover-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (safety)
DROP POLICY IF EXISTS "Public can view cover photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload cover photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own cover photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own cover photos" ON storage.objects;

-- Allow public read access to cover photos
CREATE POLICY "Public can view cover photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cover-photos');

-- Allow authenticated users to upload cover photos
CREATE POLICY "Authenticated can upload cover photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cover-photos');

-- Allow users to update their own cover photos
CREATE POLICY "Users can update own cover photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'cover-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own cover photos
CREATE POLICY "Users can delete own cover photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'cover-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## Why This Works

| Policy | Purpose |
|--------|---------|
| Public SELECT | Cover photos are public profile images - anyone can view |
| Authenticated INSERT | Any logged-in user can upload their cover photo |
| User-scoped UPDATE/DELETE | Users can only modify files in their own folder (`{user_id}/cover-*.jpg`) |

The folder structure `${user.id}/cover-${timestamp}.jpg` used in the code aligns with these RLS policies.

---

## Files Changed

| File | Change |
|------|--------|
| Database migration | Create `cover-photos` bucket with RLS policies |

---

## Testing After Fix

1. Go to `/onboarding/professional`
2. Upload a cover photo
3. Click "Submit for Verification"
4. Should succeed without "Bucket not found" error
5. Cover photo URL should be saved to `professional_profiles.cover_image_url`

