-- Phase 8 Enhanced: Notifications System

-- Notification delivery log (tracks all notification attempts across channels)
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.activity_feed(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Channel information
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'push', 'sms')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'skipped')),
  
  -- Delivery details
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Provider details (e.g., Twilio message SID, FCM message ID)
  provider_id TEXT,
  provider_response JSONB,
  
  -- Smart routing
  is_escalated BOOLEAN DEFAULT false,
  escalated_from TEXT, -- previous channel that failed
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Subscription data
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  
  -- Device/browser info
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, endpoint)
);

-- SMS phone numbers
CREATE TABLE IF NOT EXISTS public.user_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  phone_number TEXT NOT NULL,
  country_code TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT true,
  
  -- Verification
  verification_code TEXT,
  verification_sent_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, phone_number)
);

-- Contract-based notification rules
CREATE TABLE IF NOT EXISTS public.notification_muting_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- What to mute
  mute_type TEXT NOT NULL CHECK (mute_type IN ('contract', 'job', 'user', 'category')),
  entity_id UUID, -- contract_id, job_id, user_id, or category_id
  
  -- When to mute
  reason TEXT, -- 'dispute', 'paused', 'blocked', 'custom'
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  
  -- What channels to mute (null = all channels)
  muted_channels TEXT[] DEFAULT ARRAY['email', 'push', 'sms']::TEXT[],
  muted_categories TEXT[] DEFAULT ARRAY['message', 'reminder']::TEXT[],
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin priority notifications (bypass user preferences)
CREATE TABLE IF NOT EXISTS public.priority_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.activity_feed(id) ON DELETE CASCADE,
  
  -- Priority level
  priority_level TEXT NOT NULL DEFAULT 'P2' CHECK (priority_level IN ('P0', 'P1', 'P2', 'P3')),
  
  -- P0 = Critical system/safety (bypass everything)
  -- P1 = Urgent safety/security (bypass most filters)
  -- P2 = High priority (bypass some filters)
  -- P3 = Normal priority
  
  -- Who sent it
  sent_by UUID REFERENCES public.profiles(id),
  reason TEXT,
  
  -- Bypass settings
  bypass_quiet_hours BOOLEAN DEFAULT false,
  bypass_muting_rules BOOLEAN DEFAULT false,
  force_all_channels BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend notification_preferences with more fields
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '22:00:00',
  ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '08:00:00',
  ADD COLUMN IF NOT EXISTS quiet_hours_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS smart_routing_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS escalation_delay_minutes INTEGER DEFAULT 120; -- 2 hours

-- Indexes
CREATE INDEX idx_notification_deliveries_notification ON public.notification_deliveries(notification_id);
CREATE INDEX idx_notification_deliveries_user ON public.notification_deliveries(user_id);
CREATE INDEX idx_notification_deliveries_status ON public.notification_deliveries(status);
CREATE INDEX idx_notification_deliveries_channel ON public.notification_deliveries(channel);
CREATE INDEX idx_notification_deliveries_sent_at ON public.notification_deliveries(sent_at);

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON public.push_subscriptions(is_active) WHERE is_active = true;

CREATE INDEX idx_phone_numbers_user ON public.user_phone_numbers(user_id);
CREATE INDEX idx_phone_numbers_verified ON public.user_phone_numbers(is_verified) WHERE is_verified = true;

CREATE INDEX idx_muting_rules_user ON public.notification_muting_rules(user_id);
CREATE INDEX idx_muting_rules_active ON public.notification_muting_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_muting_rules_entity ON public.notification_muting_rules(entity_id);

CREATE INDEX idx_priority_notifications_notification ON public.priority_notifications(notification_id);
CREATE INDEX idx_priority_notifications_level ON public.priority_notifications(priority_level);

-- RLS Policies
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_muting_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priority_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own delivery logs
CREATE POLICY "Users can view their notification deliveries"
  ON public.notification_deliveries
  FOR SELECT
  USING (user_id = auth.uid());

-- System can insert/update deliveries
CREATE POLICY "System can manage notification deliveries"
  ON public.notification_deliveries
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users manage their push subscriptions
CREATE POLICY "Users can manage their push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users manage their phone numbers
CREATE POLICY "Users can manage their phone numbers"
  ON public.user_phone_numbers
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users manage their muting rules
CREATE POLICY "Users can manage their muting rules"
  ON public.notification_muting_rules
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Only admins can create priority notifications
CREATE POLICY "Admins can manage priority notifications"
  ON public.priority_notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Anyone can read priority levels (for display purposes)
CREATE POLICY "Anyone can view priority notifications"
  ON public.priority_notifications
  FOR SELECT
  USING (true);

-- Function to check if user should receive notification
CREATE OR REPLACE FUNCTION public.should_send_notification(
  p_user_id UUID,
  p_notification_id UUID,
  p_channel TEXT,
  p_category TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefs RECORD;
  v_priority RECORD;
  v_is_muted BOOLEAN;
  v_in_quiet_hours BOOLEAN;
  v_user_time TIME;
BEGIN
  -- Check if this is a priority notification
  SELECT * INTO v_priority
  FROM public.priority_notifications
  WHERE notification_id = p_notification_id;
  
  -- P0 notifications always send
  IF v_priority.priority_level = 'P0' THEN
    RETURN true;
  END IF;
  
  -- Get user preferences
  SELECT * INTO v_prefs
  FROM public.notification_preferences
  WHERE user_id = p_user_id;
  
  -- Check if channel is enabled
  IF p_channel = 'email' AND NOT COALESCE(v_prefs.email_digest_enabled, true) THEN
    RETURN false;
  END IF;
  
  IF p_channel = 'sms' AND NOT COALESCE(v_prefs.sms_enabled, false) THEN
    RETURN false;
  END IF;
  
  IF p_channel = 'push' AND NOT COALESCE(v_prefs.push_enabled, false) THEN
    RETURN false;
  END IF;
  
  -- Check muting rules (unless priority bypasses)
  IF NOT COALESCE(v_priority.bypass_muting_rules, false) THEN
    SELECT EXISTS (
      SELECT 1 FROM public.notification_muting_rules
      WHERE user_id = p_user_id
        AND is_active = true
        AND (end_date IS NULL OR end_date > NOW())
        AND (muted_channels IS NULL OR p_channel = ANY(muted_channels))
        AND (muted_categories IS NULL OR p_category = ANY(muted_categories))
    ) INTO v_is_muted;
    
    IF v_is_muted THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Check quiet hours (unless priority bypasses)
  IF NOT COALESCE(v_priority.bypass_quiet_hours, false) 
     AND COALESCE(v_prefs.quiet_hours_enabled, false) THEN
    
    -- Get current time in user's timezone
    v_user_time := (NOW() AT TIME ZONE COALESCE(v_prefs.timezone, 'UTC'))::TIME;
    
    -- Check if current time is in quiet hours
    IF v_prefs.quiet_hours_start < v_prefs.quiet_hours_end THEN
      v_in_quiet_hours := v_user_time >= v_prefs.quiet_hours_start 
                          AND v_user_time < v_prefs.quiet_hours_end;
    ELSE
      -- Handle overnight quiet hours (e.g., 22:00 to 08:00)
      v_in_quiet_hours := v_user_time >= v_prefs.quiet_hours_start 
                          OR v_user_time < v_prefs.quiet_hours_end;
    END IF;
    
    IF v_in_quiet_hours THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Trigger to auto-create muting rules when dispute is filed
CREATE OR REPLACE FUNCTION public.auto_mute_disputes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contract RECORD;
BEGIN
  -- Get contract details
  SELECT * INTO v_contract
  FROM public.contracts
  WHERE id = NEW.contract_id;
  
  IF v_contract IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Mute notifications for both parties
  INSERT INTO public.notification_muting_rules (
    user_id,
    mute_type,
    entity_id,
    reason,
    muted_categories
  ) VALUES
    (v_contract.client_id, 'contract', v_contract.id, 'dispute', ARRAY['message', 'reminder']::TEXT[]),
    (v_contract.tasker_id, 'contract', v_contract.id, 'dispute', ARRAY['message', 'reminder']::TEXT[])
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_mute_disputes ON public.disputes;
CREATE TRIGGER trigger_auto_mute_disputes
  AFTER INSERT ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_mute_disputes();