-- Fix critical security issue: Private Job Details Exposed to Unauthorized Users
-- This migration restricts job visibility to only job owners and qualified professionals

-- Step 1: Create a security definer function to check if a professional is qualified to view a job
CREATE OR REPLACE FUNCTION public.can_professional_view_job(_user_id uuid, _job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  job_record RECORD;
  user_profile RECORD;
BEGIN
  -- Get job details
  SELECT micro_id, client_id, status INTO job_record
  FROM public.jobs 
  WHERE id = _job_id;
  
  -- If job doesn't exist or is not open, deny access
  IF job_record IS NULL OR job_record.status != 'open' THEN
    RETURN false;
  END IF;
  
  -- Get user profile and check if they're a professional
  SELECT roles, active_role INTO user_profile
  FROM public.profiles 
  WHERE id = _user_id;
  
  -- Must be a professional with professional role
  IF user_profile IS NULL OR 
     NOT (user_profile.roles ? 'professional') OR 
     user_profile.active_role != 'professional' THEN
    RETURN false;
  END IF;
  
  -- Check if professional has relevant services that match the job's micro service
  IF EXISTS (
    SELECT 1 FROM public.professional_services ps
    WHERE ps.professional_id = _user_id 
    AND ps.micro_service_id = job_record.micro_id
    AND ps.is_active = true
  ) THEN
    RETURN true;
  END IF;
  
  -- If no professional_services table exists or no direct match, 
  -- allow verified professionals as fallback
  IF EXISTS (
    SELECT 1 FROM public.professional_profiles pp
    WHERE pp.user_id = _user_id 
    AND pp.verification_status = 'verified'
    AND pp.is_active = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Default deny - restrict access to unverified professionals
  RETURN false;
END;
$$;

-- Step 2: Drop the insecure policy and create a secure one
DROP POLICY IF EXISTS "Users can view relevant jobs" ON public.jobs;

CREATE POLICY "Secure job visibility - owners and qualified professionals only" 
ON public.jobs
FOR SELECT 
USING (
  -- Job owners can always see their own jobs
  (auth.uid() = client_id) 
  OR 
  -- Only qualified professionals can see jobs they're eligible for
  (public.can_professional_view_job(auth.uid(), id))
);

-- Step 3: Create audit logging function for job access monitoring
CREATE OR REPLACE FUNCTION public.log_job_view_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only log when non-owners view jobs for security monitoring
  IF auth.uid() IS NOT NULL AND auth.uid() != NEW.client_id THEN
    PERFORM public.log_activity(
      'job_viewed',
      'job', 
      NEW.id,
      jsonb_build_object(
        'viewer_id', auth.uid(),
        'job_title', NEW.title,
        'job_status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;