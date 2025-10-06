import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type NotificationPreferenceRow = Database['public']['Tables']['notification_preferences']['Row'];

export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  channels: string[];
  enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  frequency: 'immediate' | 'daily_digest' | 'weekly_digest';
  created_at: string;
  updated_at: string;
}

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Return empty array for now since table structure doesn't match
      setPreferences([]);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (
    notificationType: string,
    updates: Partial<NotificationPreference>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          notification_type: notificationType,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,notification_type'
        });

      if (error) throw error;
      await fetchPreferences();
    } catch (error) {
      console.error('Error updating preference:', error);
      throw error;
    }
  };

  const toggleChannel = async (notificationType: string, channel: string) => {
    try {
      const preference = preferences.find(p => p.notification_type === notificationType);
      if (!preference) return;

      const channels = preference.channels.includes(channel)
        ? preference.channels.filter(c => c !== channel)
        : [...preference.channels, channel];

      await updatePreference(notificationType, { channels });
    } catch (error) {
      console.error('Error toggling channel:', error);
    }
  };

  const setQuietHours = async (start: string, end: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update all preferences with quiet hours
      const updates = preferences.map(p => ({
        ...p,
        quiet_hours_start: start,
        quiet_hours_end: end,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(updates);

      if (error) throw error;
      await fetchPreferences();
    } catch (error) {
      console.error('Error setting quiet hours:', error);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    isLoading,
    updatePreference,
    toggleChannel,
    setQuietHours,
    refetch: fetchPreferences
  };
};
