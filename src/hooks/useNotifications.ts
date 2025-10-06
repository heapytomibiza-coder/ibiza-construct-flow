import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  category: string;
  action_url?: string;
  action_text?: string;
  entity_type?: string;
  entity_id?: string;
  metadata: any;
  read_at?: string;
  dismissed_at?: string;
  expires_at?: string;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    const { data, error } = await (supabase as any)
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    setNotifications((data || []) as any);
    setUnreadCount((data || []).filter(n => !n.read_at).length);
    setLoading(false);
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    }
  };

  // Dismiss notification
  const dismissNotification = async (notificationId: string) => {
    // Remove from local state
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Update in database
    await (supabase as any)
      .from('notifications')
      .update({ dismissed_at: new Date().toISOString() })
      .eq('id', notificationId);
  };

  // Dismiss multiple notifications
  const dismiss = async (notificationIds: string[]) => {
    // Remove from local state
    setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
    
    // Update in database
    for (const id of notificationIds) {
      await (supabase as any)
        .from('notifications')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', id);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast for new notifications
          toast.success(newNotification.title, {
            description: newNotification.message,
            action: newNotification.action_url ? {
              label: 'View',
              onClick: () => window.location.href = newNotification.action_url!
            } : undefined
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    notificationsLoading: loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismiss,
    refresh: fetchNotifications
  };
};
