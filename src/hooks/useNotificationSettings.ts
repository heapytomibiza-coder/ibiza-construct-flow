import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationSettings {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  notification_frequency: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  categories: {
    jobs: boolean;
    messages: boolean;
    bookings: boolean;
    reviews: boolean;
    payments: boolean;
    system: boolean;
  };
}

export const useNotificationSettings = (userId?: string) => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  const fetchSettings = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      let { data, error } = await (supabase as any)
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Create default settings if not exists
      if (!data) {
        const { data: newSettings, error: insertError } = await (supabase as any)
          .from('user_notification_settings')
          .insert({ user_id: userId })
          .select()
          .single();

        if (insertError) throw insertError;
        data = newSettings;
      }

      setSettings(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('user_notification_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      toast({
        title: 'Success',
        description: 'Notification settings updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (category: string, enabled: boolean) => {
    if (!settings) return;

    const updatedCategories = {
      ...settings.categories,
      [category]: enabled,
    };

    await updateSettings({ categories: updatedCategories as any });
  };

  return {
    settings,
    loading,
    updateSettings,
    updateCategory,
    refresh: fetchSettings,
  };
};
