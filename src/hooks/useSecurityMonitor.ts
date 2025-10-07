import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  id: string;
  event_type: string;
  event_category: string;
  severity: string;
  detected_at: string;
  status: string;
  event_data: any;
}

export interface ActiveSession {
  id: string;
  ip_address: string;
  user_agent: string;
  device_info: any;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

export const useSecurityMonitor = () => {
  const queryClient = useQueryClient();

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: { action: 'get_events' },
      });

      if (error) throw error;
      return data.events as SecurityEvent[];
    },
  });

  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: { action: 'get_active_sessions' },
      });

      if (error) throw error;
      return data.sessions as ActiveSession[];
    },
  });

  const { data: suspiciousActivity } = useQuery({
    queryKey: ['suspicious-activity'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: { action: 'check_suspicious_activity' },
      });

      if (error) throw error;
      return data.suspicious;
    },
    refetchInterval: 60000, // Check every minute
  });

  const logSecurityEvent = useMutation({
    mutationFn: async (eventData: {
      event_type: string;
      event_category: string;
      severity?: string;
      event_data?: any;
    }) => {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: {
          action: 'log_event',
          data: eventData,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
    },
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: {
          action: 'revoke_session',
          data: { session_id: sessionId },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
  });

  return {
    events,
    sessions,
    suspiciousActivity,
    isLoading: isLoadingEvents || isLoadingSessions,
    logSecurityEvent: logSecurityEvent.mutate,
    revokeSession: revokeSession.mutate,
  };
};
