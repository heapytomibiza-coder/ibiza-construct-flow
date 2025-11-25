-- Add email_digest_enabled column to notification_preferences
ALTER TABLE public.notification_preferences
ADD COLUMN IF NOT EXISTS email_digest_enabled boolean DEFAULT true;

-- Add index for digest queries
CREATE INDEX IF NOT EXISTS idx_notification_prefs_digest 
ON public.notification_preferences(user_id) 
WHERE email_digest_enabled = true;

-- Add comment
COMMENT ON COLUMN public.notification_preferences.email_digest_enabled IS 'Whether user wants to receive weekly review digest emails';
