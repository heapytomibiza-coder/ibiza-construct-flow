import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdminActions = () => {
  const queryClient = useQueryClient();

  const logAction = useMutation({
    mutationFn: async ({
      actionType,
      targetType,
      targetId,
      actionData,
    }: {
      actionType: string;
      targetType: string;
      targetId: string;
      actionData?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.rpc('log_admin_action', {
        p_action_type: actionType,
        p_target_type: targetType,
        p_target_id: targetId,
        p_action_data: actionData,
      });

      if (error) throw error;
      return data;
    },
  });

  const createActivity = useMutation({
    mutationFn: async ({
      activityType,
      entityType,
      entityId,
      title,
      description,
      severity = 'info',
      metadata,
    }: {
      activityType: string;
      entityType: string;
      entityId: string;
      title: string;
      description?: string;
      severity?: 'info' | 'warning' | 'critical';
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.rpc('create_admin_activity', {
        p_activity_type: activityType,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_title: title,
        p_description: description,
        p_severity: severity,
        p_metadata: metadata,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-activity-feed'] });
    },
  });

  const markActivityRead = useMutation({
    mutationFn: async (activityId: string) => {
      const { error } = await supabase
        .from('admin_activity_feed')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', activityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-activity-feed'] });
    },
  });

  return {
    logAction: logAction.mutateAsync,
    createActivity: createActivity.mutateAsync,
    markActivityRead: markActivityRead.mutateAsync,
    isLogging: logAction.isPending || createActivity.isPending,
  };
};