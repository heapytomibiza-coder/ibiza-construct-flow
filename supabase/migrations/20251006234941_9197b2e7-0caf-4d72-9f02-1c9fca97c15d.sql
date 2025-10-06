-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL, -- 'profile', 'booking', 'review', 'social', 'milestone'
  points_reward INTEGER NOT NULL DEFAULT 0,
  requirement_type TEXT NOT NULL, -- 'count', 'streak', 'threshold'
  requirement_value INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_displayed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, badge_id)
);

-- Create loyalty_tiers table
CREATE TABLE public.loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL UNIQUE,
  points_required INTEGER NOT NULL,
  perks JSONB NOT NULL DEFAULT '[]'::jsonb,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create points_transactions table
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earn', 'spend', 'bonus', 'referral'
  source TEXT NOT NULL, -- 'booking', 'review', 'achievement', 'referral', 'admin'
  source_id UUID,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_points table for current balance
CREATE TABLE public.user_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_balance INTEGER NOT NULL DEFAULT 0,
  tier_id UUID REFERENCES public.loyalty_tiers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create referral_codes table
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id),
  referrer_reward_points INTEGER,
  referred_reward_points INTEGER,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

-- Create leaderboards table
CREATE TABLE public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  leaderboard_type TEXT NOT NULL, -- 'points', 'bookings', 'reviews', 'earnings'
  period TEXT NOT NULL, -- 'all_time', 'monthly', 'weekly', 'daily'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create leaderboard_entries table
CREATE TABLE public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id UUID NOT NULL REFERENCES public.leaderboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  score INTEGER NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(leaderboard_id, user_id, period_start)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements
CREATE POLICY "Anyone can view active achievements"
  ON public.achievements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage achievements"
  ON public.achievements FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create user achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own achievement progress"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for badges
CREATE POLICY "Anyone can view active badges"
  ON public.badges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage badges"
  ON public.badges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' displayed badges"
  ON public.user_badges FOR SELECT
  USING (is_displayed = true);

CREATE POLICY "System can award badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update badge display"
  ON public.user_badges FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for loyalty_tiers
CREATE POLICY "Anyone can view loyalty tiers"
  ON public.loyalty_tiers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage loyalty tiers"
  ON public.loyalty_tiers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for points_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.points_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
  ON public.points_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all transactions"
  ON public.points_transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_points
CREATE POLICY "Users can view their own points"
  ON public.user_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' points"
  ON public.user_points FOR SELECT
  USING (true);

CREATE POLICY "System can manage user points"
  ON public.user_points FOR ALL
  WITH CHECK (true);

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Users can view referrals they're involved in"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

-- RLS Policies for leaderboards
CREATE POLICY "Anyone can view active leaderboards"
  ON public.leaderboards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage leaderboards"
  ON public.leaderboards FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for leaderboard_entries
CREATE POLICY "Anyone can view leaderboard entries"
  ON public.leaderboard_entries FOR SELECT
  USING (true);

CREATE POLICY "System can manage leaderboard entries"
  ON public.leaderboard_entries FOR ALL
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_points_transactions_user_id ON public.points_transactions(user_id);
CREATE INDEX idx_points_transactions_created_at ON public.points_transactions(created_at DESC);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_leaderboard_entries_leaderboard_id ON public.leaderboard_entries(leaderboard_id);
CREATE INDEX idx_leaderboard_entries_rank ON public.leaderboard_entries(rank);

-- Function to update user points
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_points (user_id, total_points, current_balance)
  VALUES (NEW.user_id, NEW.points, NEW.points)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + NEW.points,
    current_balance = CASE
      WHEN NEW.transaction_type = 'spend' THEN user_points.current_balance - ABS(NEW.points)
      ELSE user_points.current_balance + NEW.points
    END,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Trigger to update user points
CREATE TRIGGER update_user_points_trigger
  AFTER INSERT ON public.points_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_points();

-- Function to update user tier based on points
CREATE OR REPLACE FUNCTION public.update_user_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier_id UUID;
BEGIN
  SELECT id INTO v_tier_id
  FROM public.loyalty_tiers
  WHERE points_required <= NEW.total_points
  ORDER BY points_required DESC
  LIMIT 1;
  
  IF v_tier_id IS NOT NULL THEN
    UPDATE public.user_points
    SET tier_id = v_tier_id
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update user tier
CREATE TRIGGER update_user_tier_trigger
  AFTER UPDATE OF total_points ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_tier();

-- Insert default loyalty tiers
INSERT INTO public.loyalty_tiers (name, level, points_required, perks, color) VALUES
  ('Bronze', 1, 0, '["5% discount on services"]'::jsonb, '#CD7F32'),
  ('Silver', 2, 1000, '["10% discount on services", "Priority support"]'::jsonb, '#C0C0C0'),
  ('Gold', 3, 5000, '["15% discount on services", "Priority support", "Free cancellations"]'::jsonb, '#FFD700'),
  ('Platinum', 4, 15000, '["20% discount on services", "VIP support", "Free cancellations", "Exclusive offers"]'::jsonb, '#E5E4E2');

-- Insert default achievements
INSERT INTO public.achievements (name, description, category, points_reward, requirement_type, requirement_value) VALUES
  ('First Booking', 'Complete your first booking', 'booking', 100, 'count', 1),
  ('Profile Complete', 'Complete your profile 100%', 'profile', 50, 'threshold', 100),
  ('Review Master', 'Write 50 reviews', 'review', 500, 'count', 50),
  ('Booking Streak', 'Complete 5 bookings in a row', 'booking', 250, 'streak', 5),
  ('Early Adopter', 'Join within the first month', 'milestone', 200, 'threshold', 1),
  ('Social Butterfly', 'Refer 10 friends', 'social', 1000, 'count', 10),
  ('Power User', 'Complete 100 bookings', 'booking', 2000, 'count', 100);

-- Insert default badges
INSERT INTO public.badges (name, description, rarity, requirement_type, requirement_value) VALUES
  ('Verified Pro', 'Verified professional status', 'rare', 'verification', 1),
  ('Top Rated', 'Maintain 4.8+ rating with 50+ reviews', 'epic', 'rating', 48),
  ('Quick Responder', 'Average response time under 1 hour', 'common', 'response_time', 60),
  ('Community Champion', 'Help 100+ clients', 'legendary', 'bookings', 100),
  ('Referral Legend', 'Refer 50+ users', 'legendary', 'referrals', 50);
