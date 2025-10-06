-- Create user blocking system
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their blocks" ON public.user_blocks
  FOR ALL USING (auth.uid() = blocker_id);

CREATE POLICY "Users can view blocks against them" ON public.user_blocks
  FOR SELECT USING (auth.uid() = blocked_id);

-- Create message reporting system
CREATE TABLE IF NOT EXISTS public.message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) NOT NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report messages" ON public.message_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage reports" ON public.message_reports
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.message_rate_limits (
  user_id UUID REFERENCES public.profiles(id) PRIMARY KEY,
  messages_sent INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT now(),
  is_throttled BOOLEAN DEFAULT false,
  throttled_until TIMESTAMPTZ
);

ALTER TABLE public.message_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their rate limits" ON public.message_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Create spam keywords table
CREATE TABLE IF NOT EXISTS public.spam_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL UNIQUE,
  severity TEXT DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.spam_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage spam keywords" ON public.spam_keywords
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create attachment metadata table
CREATE TABLE IF NOT EXISTS public.message_attachment_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  virus_scan_status TEXT DEFAULT 'pending',
  virus_scan_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.message_attachment_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view attachment metadata" ON public.message_attachment_metadata
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM public.messages 
      WHERE sender_id = auth.uid() OR recipient_id = auth.uid()
    )
  );

-- Check if user is blocked function
CREATE OR REPLACE FUNCTION public.check_user_blocked(
  p_sender_id UUID,
  p_recipient_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE blocker_id = p_recipient_id 
      AND blocked_id = p_sender_id
  );
END;
$$;

-- Check and enforce rate limits function
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit RECORD;
  v_max_per_hour INTEGER := 50;
  v_max_per_day INTEGER := 200;
BEGIN
  SELECT * INTO v_limit FROM public.message_rate_limits WHERE user_id = p_user_id;
  
  IF v_limit IS NULL THEN
    INSERT INTO public.message_rate_limits (user_id, messages_sent, window_start)
    VALUES (p_user_id, 0, now())
    RETURNING * INTO v_limit;
  END IF;
  
  IF v_limit.window_start < now() - interval '1 hour' THEN
    UPDATE public.message_rate_limits 
    SET messages_sent = 0, window_start = now(), is_throttled = false, throttled_until = NULL
    WHERE user_id = p_user_id;
    RETURN jsonb_build_object('allowed', true, 'remaining', v_max_per_hour);
  END IF;
  
  IF v_limit.is_throttled AND v_limit.throttled_until > now() THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'throttled',
      'retry_after', extract(epoch from (v_limit.throttled_until - now()))
    );
  END IF;
  
  IF v_limit.messages_sent >= v_max_per_hour THEN
    UPDATE public.message_rate_limits
    SET is_throttled = true, throttled_until = window_start + interval '1 hour'
    WHERE user_id = p_user_id;
    RETURN jsonb_build_object('allowed', false, 'reason', 'rate_limit_exceeded');
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true, 
    'remaining', v_max_per_hour - v_limit.messages_sent
  );
END;
$$;

-- Increment message count function
CREATE OR REPLACE FUNCTION public.increment_message_count(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.message_rate_limits (user_id, messages_sent, window_start)
  VALUES (p_user_id, 1, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET messages_sent = message_rate_limits.messages_sent + 1;
END;
$$;

-- Detect spam keywords function
CREATE OR REPLACE FUNCTION public.check_spam_content(p_content TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_keyword RECORD;
  v_matches TEXT[] := '{}';
  v_max_severity TEXT := 'low';
BEGIN
  FOR v_keyword IN 
    SELECT keyword, severity 
    FROM public.spam_keywords 
    WHERE is_active = true
  LOOP
    IF p_content ~* v_keyword.keyword THEN
      v_matches := array_append(v_matches, v_keyword.keyword);
      IF v_keyword.severity = 'high' THEN 
        v_max_severity := 'high';
      ELSIF v_keyword.severity = 'medium' AND v_max_severity != 'high' THEN 
        v_max_severity := 'medium';
      END IF;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'is_spam', array_length(v_matches, 1) > 0,
    'matched_keywords', v_matches,
    'severity', v_max_severity
  );
END;
$$;