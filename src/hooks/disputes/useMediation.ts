import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type MediationSession = Database['public']['Tables']['mediation_sessions']['Row'];
type EnforcementLog = Database['public']['Tables']['enforcement_logs']['Row'];

export function useMediation(disputeId: string) {
  const [sessions, setSessions] = useState<MediationSession[]>([]);
  const [enforcement, setEnforcement] = useState<EnforcementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [sessionsRes, enforcementRes] = await Promise.all([
        supabase
          .from('mediation_sessions')
          .select('*')
          .eq('dispute_id', disputeId)
          .order('created_at', { ascending: false }),
        supabase
          .from('enforcement_logs')
          .select('*')
          .eq('dispute_id', disputeId)
          .order('performed_at', { ascending: false }),
      ]);

      if (sessionsRes.error) throw sessionsRes.error;
      if (enforcementRes.error) throw enforcementRes.error;

      setSessions((sessionsRes.data || []) as MediationSession[]);
      setEnforcement((enforcementRes.data || []) as EnforcementLog[]);
    } catch (error: any) {
      toast({
        title: 'Error loading mediation data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel(`mediation:${disputeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mediation_sessions',
          filter: `dispute_id=eq.${disputeId}`,
        },
        () => loadData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enforcement_logs',
          filter: `dispute_id=eq.${disputeId}`,
        },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [disputeId]);

  const scheduleSession = async (sessionData: Database['public']['Tables']['mediation_sessions']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('mediation_sessions')
        .insert({
          ...sessionData,
          dispute_id: disputeId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Mediation scheduled',
        description: 'The mediation session has been scheduled.',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error scheduling session',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateSession = async (
    sessionId: string,
    updates: Database['public']['Tables']['mediation_sessions']['Update']
  ) => {
    try {
      const { error } = await supabase
        .from('mediation_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'Session updated',
        description: 'Mediation session has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating session',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    sessions,
    enforcement,
    loading,
    scheduleSession,
    updateSession,
    refresh: loadData,
  };
}
