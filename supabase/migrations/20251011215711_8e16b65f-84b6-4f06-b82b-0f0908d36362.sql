-- Add missing rejection_reason column to professional_profiles
ALTER TABLE professional_profiles 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;