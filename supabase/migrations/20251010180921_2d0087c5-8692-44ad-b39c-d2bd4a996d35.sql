-- Fix can_professional_view_job function to use has_role instead of profiles.roles
CREATE OR REPLACE FUNCTION public.can_professional_view_job(_user_id uuid, _job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  job_record RECORD;
BEGIN
  -- Get job details
  SELECT micro_id, client_id, status INTO job_record
  FROM public.jobs 
  WHERE id = _job_id;
  
  -- If job doesn't exist or is not open, deny access
  IF job_record IS NULL OR job_record.status != 'open' THEN
    RETURN false;
  END IF;
  
  -- Check if user has professional role using has_role security definer function
  IF NOT has_role(_user_id, 'professional'::app_role) THEN
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
$function$;