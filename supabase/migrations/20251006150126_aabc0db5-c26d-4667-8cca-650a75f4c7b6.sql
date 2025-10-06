-- Phase 14.1A: Messaging Polish + Push Notifications
BEGIN;

-- 1) Jobs scheduling columns (for Sprint 14.2A, but included here for atomic migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='jobs' AND column_name='scheduled_at'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN scheduled_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='jobs' AND column_name='duration_minutes'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN duration_minutes INTEGER DEFAULT 60;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_at ON public.jobs (scheduled_at);

-- 2) Push notifications registry
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_devices' AND policyname='User can select own devices') THEN
    CREATE POLICY "User can select own devices" ON public.user_devices
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_devices' AND policyname='User can insert own device') THEN
    CREATE POLICY "User can insert own device" ON public.user_devices
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_devices' AND policyname='User can delete own device') THEN
    CREATE POLICY "User can delete own device" ON public.user_devices
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3) Review photos storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname='Anyone can view review photos' AND tablename='objects' AND schemaname='storage'
  ) THEN
    CREATE POLICY "Anyone can view review photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'review-photos');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname='Reviewers can upload photos' AND tablename='objects' AND schemaname='storage'
  ) THEN
    CREATE POLICY "Reviewers can upload photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'review-photos' AND auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Helpful indexes for messaging performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations (last_message_at DESC);

COMMIT;