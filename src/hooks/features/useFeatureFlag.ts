/**
 * Single Feature Flag Hook
 * Phase 32: Advanced Feature Flags & Configuration System
 * 
 * Hook for checking individual feature flags
 */

import { useMemo } from 'react';
import { featureFlagManager, FeatureContext } from '@/lib/features';

export function useFeatureFlag(key: string, context?: FeatureContext) {
  const evaluation = useMemo(() => {
    return featureFlagManager.evaluate(key, context);
  }, [key, context]);

  return {
    enabled: evaluation.enabled,
    reason: evaluation.reason,
    variant: evaluation.variant,
    evaluation,
  };
}
