-- Fix function search path security warning
DROP FUNCTION IF EXISTS generate_short_slug(text);

CREATE OR REPLACE FUNCTION generate_short_slug(company_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug from company name
  base_slug := lower(regexp_replace(unaccent(company_name), '[^a-z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Try to find unique slug
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM professional_profiles WHERE short_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;