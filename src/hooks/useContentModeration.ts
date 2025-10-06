import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FlaggedContent {
  id: string;
  content_type: string;
  content_id: string;
  flagged_by: string | null;
  reason: string;
  description: string | null;
  status: string;
  severity: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ModerationAction {
  id: string;
  flagged_content_id: string | null;
  action_type: string;
  actor_id: string;
  target_user_id: string | null;
  reason: string;
  duration_days: number | null;
  metadata: Record<string, any>;
  created_at: string;
}

export function useContentModeration() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getFlaggedContent = async (filters?: {
    status?: string;
    content_type?: string;
    severity?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('flagged_content' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.content_type) {
        query = query.eq('content_type', filters.content_type);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as FlaggedContent[];
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const flagContent = async (
    content_type: string,
    content_id: string,
    reason: string,
    description?: string,
    severity: string = 'medium'
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('flagged_content' as any).insert({
        content_type,
        content_id,
        reason,
        description,
        severity,
      } as any);

      if (error) throw error;

      toast({
        title: 'Content Flagged',
        description: 'The content has been flagged for review.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reviewContent = async (
    flagId: string,
    status: string,
    resolution_notes?: string
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('flagged_content' as any)
        .update({
          status,
          resolution_notes,
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq('id', flagId);

      if (error) throw error;

      toast({
        title: 'Review Complete',
        description: 'Content review has been updated.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const takeModerationAction = async (
    action_type: string,
    reason: string,
    target_user_id?: string,
    flagged_content_id?: string,
    duration_days?: number
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('moderation_actions' as any).insert({
        action_type,
        reason,
        target_user_id,
        flagged_content_id,
        duration_days,
      } as any);

      if (error) throw error;

      toast({
        title: 'Action Taken',
        description: 'Moderation action has been recorded.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getModerationStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_moderation_stats' as any);

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching moderation stats:', error);
      return null;
    }
  };

  return {
    loading,
    getFlaggedContent,
    flagContent,
    reviewContent,
    takeModerationAction,
    getModerationStats,
  };
}
