-- Add new fields to professional_profiles for enhanced profile display
ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS cover_image_url text,
ADD COLUMN IF NOT EXISTS tagline text,
ADD COLUMN IF NOT EXISTS video_intro_url text,
ADD COLUMN IF NOT EXISTS work_philosophy text,
ADD COLUMN IF NOT EXISTS response_guarantee_hours integer DEFAULT 24,
ADD COLUMN IF NOT EXISTS instant_booking_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS work_process_steps jsonb DEFAULT '[]'::jsonb;

-- Create professional_badges table for achievements and certifications
CREATE TABLE IF NOT EXISTS professional_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_user_id uuid REFERENCES professional_profiles(user_id) ON DELETE CASCADE NOT NULL,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_icon text,
  earned_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on professional_badges
ALTER TABLE professional_badges ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active badges
CREATE POLICY "Anyone can view active badges"
ON professional_badges
FOR SELECT
USING (is_active = true);

-- Policy: Professionals can manage their own badges
CREATE POLICY "Professionals can manage own badges"
ON professional_badges
FOR ALL
USING (professional_user_id = auth.uid());

-- Create index for faster badge lookups
CREATE INDEX IF NOT EXISTS idx_professional_badges_professional_user_id 
ON professional_badges(professional_user_id) WHERE is_active = true;