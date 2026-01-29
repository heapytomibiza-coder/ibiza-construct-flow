-- Fix CHECK constraint to allow 'application' as verification method
ALTER TABLE public.professional_verifications 
DROP CONSTRAINT IF EXISTS professional_verifications_verification_method_check;

ALTER TABLE public.professional_verifications 
ADD CONSTRAINT professional_verifications_verification_method_check 
CHECK (verification_method = ANY (ARRAY['id_document', 'business_license', 'certification', 'insurance', 'application']));

-- Delete duplicate professional_verifications, keeping the most recent one per professional_id
DELETE FROM public.professional_verifications 
WHERE id NOT IN (
  SELECT DISTINCT ON (professional_id) id 
  FROM public.professional_verifications 
  ORDER BY professional_id, created_at DESC
);

-- Add unique constraint required for ON CONFLICT (professional_id)
ALTER TABLE public.professional_verifications 
ADD CONSTRAINT professional_verifications_professional_id_unique 
UNIQUE (professional_id);