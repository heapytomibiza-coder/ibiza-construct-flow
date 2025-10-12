/**
 * Notification Preferences Hook
 * Phase 25: Advanced Notification & Communication System
 * 
 * React hook for managing notification preferences
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationPreferences } from '@/lib/notifications/types';
import { notificationManager } from '@/lib/notifications';

const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'userId'> = {
  channels: {
    in_app: true,
    email: true,
    push: false,
    sms: false,
  },
  categories: {
    system: true,
    job: true,
    quote: true,
    payment: true,
    message: true,
    reminder: true,
    marketing: false,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  frequency: {
    immediate: true,
    batched: false,
  },
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Load preferences
  useEffect(() => {
    if (!user?.id) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    let prefs = notificationManager.getPreferences(user.id);
    
    if (!prefs) {
      // Create default preferences
      prefs = {
        userId: user.id,
        ...DEFAULT_PREFERENCES,
      };
      notificationManager.setPreferences(user.id, prefs);
    }

    setPreferences(prefs);
    setLoading(false);
  }, [user?.id]);

  // Update preferences
  const updatePreferences = useCallback(
    (updates: Partial<Omit<NotificationPreferences, 'userId'>>) => {
      if (!user?.id || !preferences) return;

      const newPreferences: NotificationPreferences = {
        ...preferences,
        ...updates,
      };

      notificationManager.setPreferences(user.id, newPreferences);
      setPreferences(newPreferences);
    },
    [user?.id, preferences]
  );

  // Update specific channel
  const updateChannel = useCallback(
    (channel: keyof NotificationPreferences['channels'], enabled: boolean) => {
      if (!preferences) return;

      updatePreferences({
        channels: {
          ...preferences.channels,
          [channel]: enabled,
        },
      });
    },
    [preferences, updatePreferences]
  );

  // Update specific category
  const updateCategory = useCallback(
    (category: keyof NotificationPreferences['categories'], enabled: boolean) => {
      if (!preferences) return;

      updatePreferences({
        categories: {
          ...preferences.categories,
          [category]: enabled,
        },
      });
    },
    [preferences, updatePreferences]
  );

  // Update quiet hours
  const updateQuietHours = useCallback(
    (quietHours: NotificationPreferences['quietHours']) => {
      updatePreferences({ quietHours });
    },
    [updatePreferences]
  );

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    if (!user?.id) return;

    const defaultPrefs: NotificationPreferences = {
      userId: user.id,
      ...DEFAULT_PREFERENCES,
    };

    notificationManager.setPreferences(user.id, defaultPrefs);
    setPreferences(defaultPrefs);
  }, [user?.id]);

  return {
    preferences,
    loading,
    updatePreferences,
    updateChannel,
    updateCategory,
    updateQuietHours,
    resetToDefaults,
  };
}
