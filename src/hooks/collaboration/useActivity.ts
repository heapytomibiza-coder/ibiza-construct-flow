/**
 * Activity Hook
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * React hook for activity tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { activityTracker, Activity, ActivityType } from '@/lib/collaboration';

export function useActivity(limit?: number) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const unsubscribe = activityTracker.subscribe(activities => {
      setActivities(limit ? activities.slice(0, limit) : activities);
    });
    return unsubscribe;
  }, [limit]);

  const trackActivity = useCallback(
    (
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
    ) => {
      activityTracker.trackActivity(userId, userName, type, action, description, options);
    },
    []
  );

  const clearActivities = useCallback(() => {
    activityTracker.clearActivities();
  }, []);

  return {
    activities,
    trackActivity,
    clearActivities,
    getByUser: activityTracker.getActivitiesByUser.bind(activityTracker),
    getByResource: activityTracker.getActivitiesByResource.bind(activityTracker),
    getByType: activityTracker.getActivitiesByType.bind(activityTracker),
  };
}
