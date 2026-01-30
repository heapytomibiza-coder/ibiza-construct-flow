-- Add visibility columns for robust job listing control
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS is_publicly_listed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at timestamptz NULL;

-- Backfill: mark all 'open' jobs as publicly listed
UPDATE public.jobs
SET is_publicly_listed = true,
    published_at = COALESCE(published_at, created_at)
WHERE status = 'open';

-- Index for performance on homepage queries
CREATE INDEX IF NOT EXISTS idx_jobs_publicly_listed 
ON public.jobs(is_publicly_listed, published_at DESC NULLS LAST);