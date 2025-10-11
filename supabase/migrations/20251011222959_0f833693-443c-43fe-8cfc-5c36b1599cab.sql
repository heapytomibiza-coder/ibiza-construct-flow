-- Change experience_years from integer to text in professional_profiles
ALTER TABLE public.professional_profiles 
ALTER COLUMN experience_years TYPE text;