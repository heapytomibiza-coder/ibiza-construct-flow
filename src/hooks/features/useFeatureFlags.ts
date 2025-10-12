/**
 * Feature Flags Hook
 * Phase 32: Advanced Feature Flags & Configuration System
 * 
 * Hook for feature flag management and evaluation
 */

import { useState, useCallback, useEffect } from 'react';
import { featureFlagManager, FeatureFlag, FeatureContext } from '@/lib/features';

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);

  // Load flags
  const loadFlags = useCallback(() => {
    const allFlags = featureFlagManager.getAllFlags();
    setFlags(allFlags);
  }, []);

  // Set flag
  const setFlag = useCallback((flag: FeatureFlag) => {
    featureFlagManager.setFlag(flag);
    loadFlags();
  }, [loadFlags]);

  // Get flag
  const getFlag = useCallback((key: string): FeatureFlag | undefined => {
    return featureFlagManager.getFlag(key);
  }, []);

  // Check if enabled
  const isEnabled = useCallback((key: string, context?: FeatureContext): boolean => {
    return featureFlagManager.isEnabled(key, context);
  }, []);

  // Evaluate flag
  const evaluate = useCallback((key: string, context?: FeatureContext) => {
    return featureFlagManager.evaluate(key, context);
  }, []);

  // Delete flag
  const deleteFlag = useCallback((key: string): boolean => {
    const deleted = featureFlagManager.deleteFlag(key);
    if (deleted) {
      loadFlags();
    }
    return deleted;
  }, [loadFlags]);

  // Bulk operations
  const setMultipleFlags = useCallback((flags: FeatureFlag[]) => {
    featureFlagManager.setFlags(flags);
    loadFlags();
  }, [loadFlags]);

  // Export/Import
  const exportFlags = useCallback(() => {
    return featureFlagManager.export();
  }, []);

  const importFlags = useCallback((flags: Record<string, FeatureFlag>) => {
    featureFlagManager.import(flags);
    loadFlags();
  }, [loadFlags]);

  // Load on mount
  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  return {
    flags,
    loadFlags,
    setFlag,
    setMultipleFlags,
    getFlag,
    isEnabled,
    evaluate,
    deleteFlag,
    exportFlags,
    importFlags,
  };
}
