-- Fix function search path security issue by updating existing functions
-- Update handle_new_user function to have proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    INSERT INTO public.profiles (id, full_name, roles)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(
            CASE 
                WHEN NEW.raw_user_meta_data->>'intent_role' = 'professional' THEN '["professional"]'::jsonb
                WHEN NEW.raw_user_meta_data->>'intent_role' = 'client' THEN '["client"]'::jsonb
                ELSE '["client"]'::jsonb
            END
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function to have proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;