/**
 * Activity Tracker
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * Tracks and manages user activities
 */

import { Activity, ActivityType } from './types';

const MAX_ACTIVITIES = 100;

class ActivityTracker {
  private activities: Activity[] = [];
  private listeners = new Set<(activities: Activity[]) => void>();

  trackActivity(
    userId: string,
    userName: string,
    type: ActivityType,
    action: string,
    description: string,
    options?: {
      userAvatar?: string;
      metadata?: Record<string, any>;
      resourceId?: string;
      resourceType?: string;
    }
  ): void {
    const activity: Activity = {
      id: `activity_${Date.now()}_${Math.random()}`,
      userId,
      userName,
      userAvatar: options?.userAvatar,
      type,
      action,
      description,
      metadata: options?.metadata,
      resourceId: options?.resourceId,
      resourceType: options?.resourceType,
      timestamp: new Date(),
    };

    this.activities.unshift(activity);

    // Limit activities
    if (this.activities.length > MAX_ACTIVITIES) {
      this.activities = this.activities.slice(0, MAX_ACTIVITIES);
    }

    this.notifyListeners();
  }

  getActivities(limit?: number): Activity[] {
    return limit ? this.activities.slice(0, limit) : [...this.activities];
  }

  getActivitiesByUser(userId: string, limit?: number): Activity[] {
    const filtered = this.activities.filter(a => a.userId === userId);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  getActivitiesByResource(resourceId: string, limit?: number): Activity[] {
    const filtered = this.activities.filter(a => a.resourceId === resourceId);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  getActivitiesByType(type: ActivityType, limit?: number): Activity[] {
    const filtered = this.activities.filter(a => a.type === type);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  clearActivities(): void {
    this.activities = [];
    this.notifyListeners();
  }

  subscribe(listener: (activities: Activity[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getActivities());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const activities = this.getActivities();
    this.listeners.forEach(listener => listener(activities));
  }
}

export const activityTracker = new ActivityTracker();

// Convenience functions
export const trackCreate = (
  userId: string,
  userName: string,
  resourceType: string,
  resourceId: string,
  description: string
) => {
  activityTracker.trackActivity(
    userId,
    userName,
    'create',
    'created',
    description,
    { resourceType, resourceId }
  );
};

export const trackUpdate = (
  userId: string,
  userName: string,
  resourceType: string,
  resourceId: string,
  description: string
) => {
  activityTracker.trackActivity(
    userId,
    userName,
    'update',
    'updated',
    description,
    { resourceType, resourceId }
  );
};

export const trackDelete = (
  userId: string,
  userName: string,
  resourceType: string,
  resourceId: string,
  description: string
) => {
  activityTracker.trackActivity(
    userId,
    userName,
    'delete',
    'deleted',
    description,
    { resourceType, resourceId }
  );
};

export const trackView = (
  userId: string,
  userName: string,
  resourceType: string,
  resourceId: string,
  description: string
) => {
  activityTracker.trackActivity(
    userId,
    userName,
    'view',
    'viewed',
    description,
    { resourceType, resourceId }
  );
};
