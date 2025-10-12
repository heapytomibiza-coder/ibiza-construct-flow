/**
 * Notifications Hook
 * Phase 25: Advanced Notification & Communication System
 * 
 * React hook for managing notifications
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Notification, 
  NotificationFilter,
  NotificationCategory,
  NotificationPriority,
  NotificationChannel,
} from '@/lib/notifications/types';
import { notificationManager } from '@/lib/notifications';

export function useNotifications(filter?: NotificationFilter) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications
  const loadNotifications = useCallback(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const userFilter = { ...filter, userId: user.id };
    const results = notificationManager.getNotifications(userFilter);
    const unread = notificationManager.getUnreadCount(user.id);

    setNotifications(results);
    setUnreadCount(unread);
    setLoading(false);
  }, [user?.id, filter]);

  // Subscribe to notification updates
  useEffect(() => {
    loadNotifications();

    const unsubscribe = notificationManager.subscribe((notification) => {
      if (notification.userId === user?.id) {
        loadNotifications();
      }
    });

    return unsubscribe;
  }, [user?.id, loadNotifications]);

  // Create notification
  const createNotification = useCallback(
    async (
      title: string,
      message: string,
      options?: {
        category?: NotificationCategory;
        priority?: NotificationPriority;
        channels?: NotificationChannel[];
        metadata?: Record<string, any>;
        actionUrl?: string;
        actionLabel?: string;
        imageUrl?: string;
      }
    ) => {
      if (!user?.id) return;

      const notification = await notificationManager.create(
        user.id,
        title,
        message,
        options
      );

      loadNotifications();
      return notification;
    },
    [user?.id, loadNotifications]
  );

  // Mark as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      await notificationManager.markAsRead(notificationId);
      loadNotifications();
    },
    [loadNotifications]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    await notificationManager.markAllAsRead(user.id);
    loadNotifications();
  }, [user?.id, loadNotifications]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      await notificationManager.delete(notificationId);
      loadNotifications();
    },
    [loadNotifications]
  );

  // Get statistics
  const getStatistics = useCallback(() => {
    if (!user?.id) return null;
    return notificationManager.getStatistics(user.id);
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getStatistics,
    refresh: loadNotifications,
  };
}
