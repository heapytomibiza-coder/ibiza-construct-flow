import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAutosaveSession } from './useAutosaveSession';

interface UseEnhancedAutosaveProps {
  formType: string;
  wizardState: any;
  enabled?: boolean;
  onSessionRestored?: (sessionData: any) => void;
}

export function useEnhancedAutosave({
  formType,
  wizardState,
  enabled = true,
  onSessionRestored
}: UseEnhancedAutosaveProps) {
  const sessionChecked = useRef(false);
  const lastSavedData = useRef<any>(null);
  
  const { saveNow, loadSession, clearSession } = useAutosaveSession(
    formType, 
    wizardState, 
    enabled
  );

  // Enhanced session loading with progress detection
  const checkForSavedSession = useCallback(async () => {
    if (sessionChecked.current) return null;
    
    try {
      const savedData = await loadSession();
      sessionChecked.current = true;
      
      if (savedData && hasSignificantProgress(savedData)) {
        return savedData;
      }
      return null;
    } catch (error) {
      console.error('Error checking for saved session:', error);
      return null;
    }
  }, [loadSession]);

  // Detect if there's significant progress worth restoring
  const hasSignificantProgress = (data: any): boolean => {
    if (!data) return false;
    
    // Check if user has made meaningful progress
    const progressIndicators = [
      data.category,
      data.subcategory, 
      data.serviceId,
      data.generalAnswers?.title,
      data.generalAnswers?.location,
      Object.keys(data.microAnswers || {}).length > 0
    ];
    
    // Require at least 2 steps completed
    return progressIndicators.filter(Boolean).length >= 2;
  };

  // Smart diff to avoid unnecessary saves
  const hasDataChanged = useCallback((newData: any, oldData: any): boolean => {
    if (!oldData) return true;
    
    return JSON.stringify(newData) !== JSON.stringify(oldData);
  }, []);

  // Enhanced save with analytics
  const saveWithAnalytics = useCallback(async (stepNumber?: number) => {
    try {
      // Track conversion analytics
      await supabase.from('conversion_analytics').insert({
        session_id: crypto.randomUUID(),
        event_type: 'autosave',
        step_number: stepNumber || wizardState.step,
        metadata: {
          form_type: formType,
          has_ai_questions: (wizardState.microAnswers && Object.keys(wizardState.microAnswers).length > 0),
          completion_percentage: calculateCompletionPercentage()
        }
      });

      await saveNow();
      lastSavedData.current = { ...wizardState };
    } catch (error) {
      console.error('Error in enhanced save:', error);
    }
  }, [wizardState, formType, saveNow]);

  // Calculate completion percentage
  const calculateCompletionPercentage = (): number => {
    const totalSteps = 6;
    let completed = 0;
    
    if (wizardState.category) completed++;
    if (wizardState.subcategory) completed++;  
    if (wizardState.serviceId) completed++;
    if (wizardState.generalAnswers?.title) completed++;
    if (wizardState.generalAnswers?.location) completed++;
    if (wizardState.step >= 6) completed++;
    
    return Math.round((completed / totalSteps) * 100);
  };

  // Auto-save when wizard state changes
  useEffect(() => {
    if (!enabled || !sessionChecked.current) return;
    
    if (hasDataChanged(wizardState, lastSavedData.current)) {
      const timeoutId = setTimeout(() => {
        saveWithAnalytics();
      }, 2000); // Longer delay for better UX
      
      return () => clearTimeout(timeoutId);
    }
  }, [wizardState, enabled, hasDataChanged, saveWithAnalytics]);

  // Generate magic resume link
  const generateMagicLink = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Save current state
      await saveWithAnalytics();
      
      // Create a shareable token (in real app, this would be a secure token)
      const token = btoa(`${user.id}:${formType}:${Date.now()}`);
      return `${window.location.origin}/resume?token=${token}`;
    } catch (error) {
      console.error('Error generating magic link:', error);
      return null;
    }
  }, [formType, saveWithAnalytics]);

  // Cross-device session sync
  const syncAcrossDevices = useCallback(async () => {
    if (!enabled) return;
    
    try {
      const freshData = await loadSession();
      if (freshData && onSessionRestored) {
        // Check if remote data is more recent (simple version)
        const localTimestamp = lastSavedData.current?.timestamp || 0;
        const currentTime = Date.now();
        
        // If we have fresh data and no recent local save, restore it
        if (currentTime - localTimestamp > 30000) { // 30 seconds threshold
          onSessionRestored(freshData);
        }
      }
    } catch (error) {
      console.error('Error syncing across devices:', error);
    }
  }, [enabled, loadSession, onSessionRestored]);

  return {
    checkForSavedSession,
    saveWithAnalytics,
    clearSession,
    generateMagicLink,
    syncAcrossDevices,
    completionPercentage: calculateCompletionPercentage(),
    hasSignificantProgress: () => hasSignificantProgress(wizardState)
  };
}