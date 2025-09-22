-- Fix the search path security issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;