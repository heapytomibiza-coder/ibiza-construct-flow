-- Create AI automation tables for Phase 8
CREATE TABLE public.ai_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI recommendations table
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  confidence_score NUMERIC NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'medium',
  data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  viewed_at TIMESTAMP WITH TIME ZONE,
  actioned_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create smart matching results table
CREATE TABLE public.smart_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  match_score NUMERIC NOT NULL DEFAULT 0,
  match_reasons JSONB DEFAULT '[]',
  availability_score NUMERIC DEFAULT 0,
  skill_score NUMERIC DEFAULT 0,
  location_score NUMERIC DEFAULT 0,
  price_score NUMERIC DEFAULT 0,
  reputation_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'suggested',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI chat conversations table
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT NOT NULL,
  conversation_type TEXT NOT NULL DEFAULT 'support',
  status TEXT NOT NULL DEFAULT 'active',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI chat messages table
CREATE TABLE public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow automations table
CREATE TABLE public.workflow_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  workflow_steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  execution_history JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create predictive insights table
CREATE TABLE public.predictive_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  prediction_title TEXT NOT NULL,
  prediction_description TEXT,
  predicted_value NUMERIC,
  confidence_level NUMERIC NOT NULL DEFAULT 0,
  time_horizon TEXT,
  factors JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.ai_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage automation rules" ON public.ai_automation_rules
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

CREATE POLICY "Users can view their recommendations" ON public.ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their recommendations" ON public.ai_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations" ON public.ai_recommendations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view matches for their jobs" ON public.smart_matches
  FOR SELECT USING (
    auth.uid() IN (
      SELECT client_id FROM jobs WHERE jobs.id = smart_matches.job_id
      UNION
      SELECT professional_id
    )
  );

CREATE POLICY "Users can manage their conversations" ON public.ai_conversations
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view messages in their conversations" ON public.ai_chat_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM ai_conversations 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON public.ai_chat_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM ai_conversations 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

CREATE POLICY "Admins can manage workflow automations" ON public.workflow_automations
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM profiles WHERE roles ? 'admin'
  ));

CREATE POLICY "Users can view relevant predictive insights" ON public.predictive_insights
  FOR SELECT USING (
    entity_id = auth.uid() OR 
    auth.uid() IN (SELECT id FROM profiles WHERE roles ? 'admin')
  );

-- Create indexes for better performance
CREATE INDEX idx_ai_recommendations_user_status ON public.ai_recommendations(user_id, status);
CREATE INDEX idx_smart_matches_job_score ON public.smart_matches(job_id, match_score DESC);
CREATE INDEX idx_ai_conversations_user_session ON public.ai_conversations(user_id, session_id);
CREATE INDEX idx_predictive_insights_entity ON public.predictive_insights(entity_type, entity_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ai_automation_rules_updated_at
  BEFORE UPDATE ON public.ai_automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smart_matches_updated_at
  BEFORE UPDATE ON public.smart_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_automations_updated_at
  BEFORE UPDATE ON public.workflow_automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();