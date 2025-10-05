-- Phase 11: Role-Aware Settings System - Database Changes

-- Add missing profile columns
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "email_job_matches": true,
    "email_offers": true,
    "email_payments": true,
    "email_announcements": true,
    "email_marketing": false,
    "email_digest": "instant"
  }'::jsonb;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for avatars - Users can upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS for avatars - Anyone can view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'avatars');

-- RLS for avatars - Users can update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS for avatars - Users can delete their own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Security hardening: Fix specific functions that need search_path
-- Note: Only fixing functions that don't already have search_path set

-- Fix has_role if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' 
    AND p.proname = 'has_role'
    AND EXISTS (
      SELECT 1 FROM unnest(proconfig) cfg 
      WHERE cfg LIKE '%search_path%'
    )
  ) THEN
    ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
  END IF;
END $$;

-- Fix user_has_role if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' 
    AND p.proname = 'user_has_role'
    AND EXISTS (
      SELECT 1 FROM unnest(proconfig) cfg 
      WHERE cfg LIKE '%search_path%'
    )
  ) THEN
    ALTER FUNCTION public.user_has_role(uuid, text) SET search_path = public;
  END IF;
END $$;

-- Fix get_user_role if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' 
    AND p.proname = 'get_user_role'
    AND EXISTS (
      SELECT 1 FROM unnest(proconfig) cfg 
      WHERE cfg LIKE '%search_path%'
    )
  ) THEN
    ALTER FUNCTION public.get_user_role(uuid) SET search_path = public;
  END IF;
END $$;