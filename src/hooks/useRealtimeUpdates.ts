import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

interface JobStatusUpdate {
  id: string;
  job_id: string;
  status: string;
  location: any;
  notes: string | null;
  professional_id: string;
  created_at: string;
}

export const useRealtimeUpdates = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [jobUpdates, setJobUpdates] = useState<JobStatusUpdate[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);

  const handleNotification = useCallback((payload: any) => {
    const newNotification = payload.new as Notification;
    
    // Add to state
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast notification
    const toastConfig = {
      description: newNotification.message,
      action: newNotification.action_url ? {
        label: 'View',
        onClick: () => window.location.href = newNotification.action_url!
      } : undefined
    };

    switch (newNotification.type) {
      case 'success':
        toast.success(newNotification.title, toastConfig);
        break;
      case 'warning':
        toast.warning(newNotification.title, toastConfig);
        break;
      case 'error':
        toast.error(newNotification.title, toastConfig);
        break;
      default:
        toast.info(newNotification.title, toastConfig);
    }
  }, []);

  const handleJobUpdate = useCallback((payload: any) => {
    const update = payload.new as JobStatusUpdate;
    setJobUpdates(prev => [update, ...prev.slice(0, 19)]); // Keep last 20 updates
    
    // Show status update toast
    toast.info('Job Update', {
      description: `Job status changed to: ${update.status}`,
      action: update.job_id ? {
        label: 'View Job',
        onClick: () => console.log('Navigate to job:', update.job_id)
      } : undefined
    });
  }, []);

  const handleBadgeEarned = useCallback((payload: any) => {
    const badge = payload.new;
    toast.success('🏆 Badge Earned!', {
      description: `You earned the "${badge.key.replace('_', ' ')}" badge!`,
      duration: 5000
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Create realtime channel
    const realtimeChannel = supabase
      .channel('user-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        handleNotification
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'job_status_updates'
        },
        handleJobUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pro_badges',
          filter: `pro_id=eq.${userId}`
        },
        handleBadgeEarned
      );

    // Subscribe to channel
    realtimeChannel.subscribe((status) => {
      setConnected(status === 'SUBSCRIBED');
      if (status === 'SUBSCRIBED') {
        console.log('✅ Connected to realtime updates');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime channel error');
        toast.error('Connection lost - some features may not work');
      }
    });

    setChannel(realtimeChannel);

    // Cleanup
    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [userId, handleNotification, handleJobUpdate, handleBadgeEarned]);

  const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    setNotifications(prev =>
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, read_at: new Date().toISOString() }
          : n
      )
    );
  };

  const sendJobStatusUpdate = async (jobId: string, status: string, notes?: string, location?: any) => {
    if (!userId) return;

    const { error } = await supabase
      .from('job_status_updates')
      .insert({
        job_id: jobId,
        status,
        notes,
        location,
        professional_id: userId
      });

    if (error) {
      console.error('Error sending job status update:', error);
      toast.error('Failed to update job status');
    }
  };

  return {
    notifications,
    jobUpdates,
    connected,
    markNotificationAsRead,
    sendJobStatusUpdate,
    unreadCount: notifications.filter(n => !n.read_at).length
  };
};