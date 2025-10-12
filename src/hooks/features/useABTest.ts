/**
 * A/B Test Hook
 * Phase 32: Advanced Feature Flags & Configuration System
 * 
 * Hook for A/B testing
 */

import { useState, useCallback, useEffect } from 'react';
import { abTestManager, ABTest, Variant, FeatureContext } from '@/lib/features';

export function useABTest(testId?: string, context?: FeatureContext) {
  const [test, setTest] = useState<ABTest | undefined>(
    testId ? abTestManager.getTest(testId) : undefined
  );
  const [variant, setVariant] = useState<Variant | null>(null);

  // Get variant for user
  useEffect(() => {
    if (testId && context) {
      const assignedVariant = abTestManager.getVariant(testId, context);
      setVariant(assignedVariant);
    }
  }, [testId, context]);

  // Create test
  const createTest = useCallback((newTest: ABTest): ABTest => {
    const created = abTestManager.createTest(newTest);
    setTest(created);
    return created;
  }, []);

  // Update test
  const updateTest = useCallback((testId: string, updates: Partial<ABTest>) => {
    const updated = abTestManager.updateTest(testId, updates);
    if (updated) {
      setTest(updated);
    }
    return updated;
  }, []);

  // Start test
  const startTest = useCallback((testId: string) => {
    const started = abTestManager.startTest(testId);
    if (started) {
      setTest(started);
    }
    return started;
  }, []);

  // Pause test
  const pauseTest = useCallback((testId: string) => {
    const paused = abTestManager.pauseTest(testId);
    if (paused) {
      setTest(paused);
    }
    return paused;
  }, []);

  // Complete test
  const completeTest = useCallback((testId: string, winnerId?: string) => {
    const completed = abTestManager.completeTest(testId, winnerId);
    if (completed) {
      setTest(completed);
    }
    return completed;
  }, []);

  // Track conversion
  const trackConversion = useCallback((
    testId: string,
    userId: string,
    metricId?: string,
    value?: number
  ) => {
    abTestManager.trackConversion(testId, userId, metricId, value);
  }, []);

  // Track metric
  const trackMetric = useCallback((
    testId: string,
    userId: string,
    metricId: string,
    value: number
  ) => {
    abTestManager.trackMetric(testId, userId, metricId, value);
  }, []);

  // Get results
  const getResults = useCallback((testId: string) => {
    return abTestManager.getResults(testId);
  }, []);

  // Get all tests
  const getAllTests = useCallback((filter?: { status?: ABTest['status'] }) => {
    return abTestManager.getAllTests(filter);
  }, []);

  return {
    test,
    variant,
    createTest,
    updateTest,
    startTest,
    pauseTest,
    completeTest,
    trackConversion,
    trackMetric,
    getResults,
    getAllTests,
  };
}
