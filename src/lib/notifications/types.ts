/**
 * Notification Types
 * Phase 25: Advanced Notification & Communication System
 */

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationCategory = 
  | 'system'
  | 'job'
  | 'quote'
  | 'payment'
  | 'message'
  | 'reminder'
  | 'marketing';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;
  metadata?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  subject?: string;
  title: string;
  body: string;
  variables: string[];
  actionUrl?: string;
  actionLabel?: string;
  enabled: boolean;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    in_app: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  categories: Record<NotificationCategory, boolean>;
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
  };
  frequency?: {
    immediate: boolean;
    batched: boolean;
    batchInterval?: number; // minutes
  };
}

export interface NotificationBatch {
  id: string;
  userId: string;
  notifications: Notification[];
  scheduledFor: Date;
  sent: boolean;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  attempts: number;
  lastAttemptAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilter {
  userId?: string;
  category?: NotificationCategory;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  unreadOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
  byStatus: Record<NotificationStatus, number>;
}
