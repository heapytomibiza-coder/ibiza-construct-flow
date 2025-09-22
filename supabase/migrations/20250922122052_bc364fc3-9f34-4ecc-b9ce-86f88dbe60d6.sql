-- Fix the handle_new_user function to properly create profiles
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

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();