-- Add preferences column to profiles table for storing user dashboard preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;