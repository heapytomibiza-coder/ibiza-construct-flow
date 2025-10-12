/**
 * Notification Manager
 * Phase 25: Advanced Notification & Communication System
 * 
 * Central manager for notification operations
 */

import { 
  Notification, 
  NotificationFilter, 
  NotificationPreferences,
  NotificationChannel,
  NotificationCategory,
  NotificationPriority,
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<(notification: Notification) => void> = new Set();
  private preferences: Map<string, NotificationPreferences> = new Map();

  /**
   * Create a new notification
   */
  async create(
    userId: string,
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
      expiresAt?: Date;
    }
  ): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      userId,
      title,
      message,
      category: options?.category || 'system',
      priority: options?.priority || 'medium',
      channels: options?.channels || ['in_app'],
      status: 'pending',
      metadata: options?.metadata,
      actionUrl: options?.actionUrl,
      actionLabel: options?.actionLabel,
      imageUrl: options?.imageUrl,
      createdAt: new Date(),
      expiresAt: options?.expiresAt,
    };

    // Check user preferences
    const prefs = this.preferences.get(userId);
    if (prefs) {
      // Filter channels based on preferences
      notification.channels = notification.channels.filter(
        channel => prefs.channels[channel]
      );

      // Check if category is enabled
      if (!prefs.categories[notification.category]) {
        notification.status = 'failed';
        return notification;
      }

      // Check quiet hours
      if (this.isQuietHours(prefs)) {
        // Queue for later delivery
        notification.status = 'pending';
      }
    }

    this.notifications.set(notification.id, notification);

    // Notify listeners
    this.notifyListeners(notification);

    return notification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.status !== 'read') {
      notification.status = 'read';
      notification.readAt = new Date();
      this.notifyListeners(notification);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    const userNotifications = this.getNotifications({ userId, unreadOnly: true });
    for (const notification of userNotifications) {
      await this.markAsRead(notification.id);
    }
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: string): Promise<void> {
    this.notifications.delete(notificationId);
  }

  /**
   * Get notifications with filters
   */
  getNotifications(filter?: NotificationFilter): Notification[] {
    let results = Array.from(this.notifications.values());

    if (filter?.userId) {
      results = results.filter(n => n.userId === filter.userId);
    }

    if (filter?.category) {
      results = results.filter(n => n.category === filter.category);
    }

    if (filter?.status) {
      results = results.filter(n => n.status === filter.status);
    }

    if (filter?.priority) {
      results = results.filter(n => n.priority === filter.priority);
    }

    if (filter?.unreadOnly) {
      results = results.filter(n => n.status !== 'read');
    }

    if (filter?.startDate) {
      results = results.filter(n => n.createdAt >= filter.startDate!);
    }

    if (filter?.endDate) {
      results = results.filter(n => n.createdAt <= filter.endDate!);
    }

    // Sort by date (newest first)
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    if (filter?.offset !== undefined) {
      results = results.slice(filter.offset);
    }

    if (filter?.limit !== undefined) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  /**
   * Get notification by ID
   */
  getNotification(notificationId: string): Notification | undefined {
    return this.notifications.get(notificationId);
  }

  /**
   * Get unread count for user
   */
  getUnreadCount(userId: string): number {
    return this.getNotifications({ userId, unreadOnly: true }).length;
  }

  /**
   * Get statistics for user
   */
  getStatistics(userId: string) {
    const notifications = this.getNotifications({ userId });
    
    const stats = {
      total: notifications.length,
      unread: 0,
      byCategory: {} as Record<NotificationCategory, number>,
      byPriority: {} as Record<NotificationPriority, number>,
      byStatus: {} as Record<string, number>,
    };

    notifications.forEach(notification => {
      if (notification.status !== 'read') {
        stats.unread++;
      }

      stats.byCategory[notification.category] = 
        (stats.byCategory[notification.category] || 0) + 1;

      stats.byPriority[notification.priority] = 
        (stats.byPriority[notification.priority] || 0) + 1;

      stats.byStatus[notification.status] = 
        (stats.byStatus[notification.status] || 0) + 1;
    });

    return stats;
  }

  /**
   * Set user preferences
   */
  setPreferences(userId: string, preferences: NotificationPreferences): void {
    this.preferences.set(userId, preferences);
  }

  /**
   * Get user preferences
   */
  getPreferences(userId: string): NotificationPreferences | undefined {
    return this.preferences.get(userId);
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(listener: (notification: Notification) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(notification: Notification): void {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });
  }

  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { start, end } = preferences.quietHours;
    
    if (start < end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Handles overnight quiet hours
      return currentTime >= start || currentTime <= end;
    }
  }

  /**
   * Clean up expired notifications
   */
  cleanupExpired(): void {
    const now = new Date();
    const toDelete: string[] = [];

    this.notifications.forEach((notification, id) => {
      if (notification.expiresAt && notification.expiresAt <= now) {
        toDelete.push(id);
      }
    });

    toDelete.forEach(id => this.notifications.delete(id));
  }
}

// Global notification manager instance
export const notificationManager = new NotificationManager();
