-- Phase 1: Add subscription tier to professional_profiles and optimize job queries

-- Add subscription_tier column with check constraint
ALTER TABLE public.professional_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic' 
CHECK (subscription_tier IN ('basic', 'pro', 'premium'));

-- Add index for faster subscription-based queries
CREATE INDEX IF NOT EXISTS idx_professional_profiles_subscription 
ON public.professional_profiles(subscription_tier);

-- Add composite index for job matching queries (status + created_at)
CREATE INDEX IF NOT EXISTS idx_jobs_status_created 
ON public.jobs(status, created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.professional_profiles.subscription_tier IS 
'Subscription level: basic (free), pro ($29/mo), premium ($99/mo) - controls notification priority and early job access';