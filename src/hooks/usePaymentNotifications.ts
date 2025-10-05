import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_types: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface PaymentNotification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  channel: 'email' | 'sms' | 'push' | 'in_app';
  status: 'pending' | 'sent' | 'failed' | 'read';
  related_entity_type?: string;
  related_entity_id?: string;
  metadata?: any;
  sent_at?: string;
  read_at?: string;
  failed_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentAlert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  affected_users?: string[];
  action_required: boolean;
  action_url?: string;
  resolved_at?: string;
  resolved_by?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const usePaymentNotifications = (userId?: string) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchPreferences = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Create default preferences if none exist
      if (!data) {
        const { data: newPrefs, error: insertError } = await (supabase as any)
          .from('notification_preferences')
          .insert({ user_id: userId })
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newPrefs);
      } else {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load notification preferences');
    }
  }, [userId]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('payment_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter((n: PaymentNotification) => n.status !== 'read').length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchAlerts = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('payment_alerts')
        .select('*')
        .is('resolved_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchPreferences();
      fetchNotifications();
      fetchAlerts();
    }

    // Set up real-time subscriptions
    const notificationsChannel = (supabase as any)
      .channel('payment-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    const alertsChannel = (supabase as any)
      .channel('payment-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_alerts'
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [userId, fetchPreferences, fetchNotifications, fetchAlerts]);

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!userId || !preferences) return;

    try {
      const { data, error } = await (supabase as any)
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
      toast.success('Notification preferences updated');
      return data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      throw error;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('payment_notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const { error } = await (supabase as any)
        .from('payment_notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .neq('status', 'read');

      if (error) throw error;
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('payment_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      fetchNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  return {
    preferences,
    notifications,
    alerts,
    loading,
    unreadCount,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: () => {
      fetchPreferences();
      fetchNotifications();
      fetchAlerts();
    },
  };
};
