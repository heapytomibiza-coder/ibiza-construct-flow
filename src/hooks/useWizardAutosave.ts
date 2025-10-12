/**
 * Wizard Autosave Hook
 * MVP Feature: Automatically saves wizard state to localStorage
 * Restores draft when user returns
 */

import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface AutosaveOptions {
  key: string;
  debounceMs?: number;
  showToast?: boolean;
}

export const useWizardAutosave = <T extends Record<string, any>>(
  state: T,
  options: AutosaveOptions
) => {
  const { key, debounceMs = 1000, showToast = false } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // Save to localStorage with debounce
  const save = useCallback(() => {
    const stateJson = JSON.stringify(state);
    
    // Skip if state hasn't changed
    if (stateJson === lastSavedRef.current) {
      return;
    }

    try {
      localStorage.setItem(key, stateJson);
      lastSavedRef.current = stateJson;
      
      if (showToast) {
        toast.success('Draft saved', {
          duration: 1500,
          position: 'bottom-right'
        });
      }
    } catch (error) {
      console.error('Autosave failed:', error);
      toast.error('Failed to save draft');
    }
  }, [state, key, showToast]);

  // Debounced save
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(save, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, save, debounceMs]);

  // Load saved draft
  const loadDraft = useCallback((): Partial<T> | null => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      lastSavedRef.current = saved;
      
      return parsed as Partial<T>;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }, [key]);

  // Clear saved draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
      lastSavedRef.current = '';
      
      if (showToast) {
        toast.info('Draft cleared');
      }
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [key, showToast]);

  // Check if draft exists
  const hasDraft = useCallback((): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }, [key]);

  return {
    loadDraft,
    clearDraft,
    hasDraft,
    save: () => save() // Manual save trigger
  };
};
