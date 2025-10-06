import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificationPreference {
  id?: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  payment_reminder_days: number;
  invoice_notifications: boolean;
  payment_confirmation: boolean;
  dispute_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery<NotificationPreference | null>({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error }: any = await (supabase as any)
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as NotificationPreference | null;
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreference>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error }: any = await (supabase as any)
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Notification preferences updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: ['payment-reminders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error }: any = await (supabase as any)
        .from('payment_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferences.mutate,
    reminders,
    remindersLoading,
  };
}
