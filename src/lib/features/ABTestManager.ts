/**
 * A/B Test Manager
 * Phase 32: Advanced Feature Flags & Configuration System
 * 
 * Manages A/B tests and variant assignments
 */

import { ABTest, Variant, FeatureContext, VariantResults, ABTestResults } from './types';

export class ABTestManager {
  private static instance: ABTestManager;
  private tests: Map<string, ABTest> = new Map();
  private assignments: Map<string, Map<string, string>> = new Map(); // testId -> userId -> variantId
  private events: Map<string, any[]> = new Map(); // testId -> events

  private constructor() {}

  static getInstance(): ABTestManager {
    if (!ABTestManager.instance) {
      ABTestManager.instance = new ABTestManager();
    }
    return ABTestManager.instance;
  }

  // Create test
  createTest(test: ABTest): ABTest {
    // Validate variant weights
    const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant weights must sum to 100');
    }

    this.tests.set(test.id, test);
    this.assignments.set(test.id, new Map());
    this.events.set(test.id, []);
    return test;
  }

  // Get test
  getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId);
  }

  // Get all tests
  getAllTests(filter?: { status?: ABTest['status'] }): ABTest[] {
    let tests = Array.from(this.tests.values());
    
    if (filter?.status) {
      tests = tests.filter(t => t.status === filter.status);
    }

    return tests;
  }

  // Update test
  updateTest(testId: string, updates: Partial<ABTest>): ABTest | undefined {
    const test = this.tests.get(testId);
    if (!test) return undefined;

    Object.assign(test, updates);
    test.updatedAt = new Date();
    return test;
  }

  // Start test
  startTest(testId: string): ABTest | undefined {
    const test = this.tests.get(testId);
    if (!test) return undefined;

    test.status = 'running';
    test.startDate = new Date();
    return test;
  }

  // Pause test
  pauseTest(testId: string): ABTest | undefined {
    const test = this.tests.get(testId);
    if (!test) return undefined;

    test.status = 'paused';
    return test;
  }

  // Complete test
  completeTest(testId: string, winnerId?: string): ABTest | undefined {
    const test = this.tests.get(testId);
    if (!test) return undefined;

    test.status = 'completed';
    test.endDate = new Date();
    test.winningVariant = winnerId;
    test.results = this.calculateResults(testId);
    return test;
  }

  // Get variant for user
  getVariant(testId: string, context: FeatureContext): Variant | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    const userId = context.userId || 'anonymous';

    // Check if user is already assigned
    const assignments = this.assignments.get(testId);
    const existingVariantId = assignments?.get(userId);
    if (existingVariantId) {
      return test.variants.find(v => v.id === existingVariantId) || null;
    }

    // Check if user should be in test (based on target percentage)
    if (!this.isUserInTest(testId, userId, test.targetPercentage)) {
      return null;
    }

    // Assign variant based on weights
    const variant = this.assignVariant(test, userId);
    if (variant) {
      assignments?.set(userId, variant.id);
      
      // Track exposure
      this.trackEvent(testId, {
        type: 'variant_assigned',
        userId,
        variantId: variant.id,
        timestamp: new Date(),
      });
    }

    return variant;
  }

  // Assign variant to user
  private assignVariant(test: ABTest, userId: string): Variant | null {
    const enabledVariants = test.variants.filter(v => v.enabled);
    if (enabledVariants.length === 0) return null;

    // Use consistent hashing to assign variant
    const hash = this.hash(`${test.id}:${userId}`);
    const bucket = hash % 100;

    let cumulative = 0;
    for (const variant of enabledVariants) {
      cumulative += variant.weight;
      if (bucket < cumulative) {
        return variant;
      }
    }

    return enabledVariants[0];
  }

  // Check if user should be included in test
  private isUserInTest(testId: string, userId: string, targetPercentage: number): boolean {
    if (targetPercentage >= 100) return true;
    if (targetPercentage <= 0) return false;

    const hash = this.hash(`${testId}:target:${userId}`);
    const bucket = hash % 100;
    return bucket < targetPercentage;
  }

  // Track conversion
  trackConversion(testId: string, userId: string, metricId?: string, value?: number): void {
    this.trackEvent(testId, {
      type: 'conversion',
      userId,
      metricId,
      value,
      timestamp: new Date(),
    });
  }

  // Track metric
  trackMetric(testId: string, userId: string, metricId: string, value: number): void {
    this.trackEvent(testId, {
      type: 'metric',
      userId,
      metricId,
      value,
      timestamp: new Date(),
    });
  }

  // Track event
  private trackEvent(testId: string, event: any): void {
    const events = this.events.get(testId);
    if (events) {
      events.push(event);
    }
  }

  // Calculate test results
  calculateResults(testId: string): ABTestResults {
    const test = this.tests.get(testId);
    const events = this.events.get(testId) || [];
    const assignments = this.assignments.get(testId);

    if (!test || !assignments) {
      return {
        variantResults: [],
        significantDifference: false,
      };
    }

    // Calculate results for each variant
    const variantResults: VariantResults[] = test.variants.map(variant => {
      const variantUsers = Array.from(assignments.entries())
        .filter(([_, vId]) => vId === variant.id)
        .map(([userId]) => userId);

      const exposures = variantUsers.length;
      const conversions = events.filter(
        e => e.type === 'conversion' && variantUsers.includes(e.userId)
      ).length;

      const conversionRate = exposures > 0 ? (conversions / exposures) * 100 : 0;

      // Calculate revenue if applicable
      const revenueEvents = events.filter(
        e => e.type === 'conversion' && e.value && variantUsers.includes(e.userId)
      );
      const revenue = revenueEvents.reduce((sum, e) => sum + (e.value || 0), 0);
      const avgValue = revenueEvents.length > 0 ? revenue / revenueEvents.length : 0;

      // Calculate custom metrics
      const metrics: Record<string, number> = {};
      test.metrics.forEach(metric => {
        const metricEvents = events.filter(
          e => e.type === 'metric' && e.metricId === metric.id && variantUsers.includes(e.userId)
        );
        metrics[metric.id] = metricEvents.reduce((sum, e) => sum + (e.value || 0), 0);
      });

      return {
        variantId: variant.id,
        exposures,
        conversions,
        conversionRate,
        revenue,
        avgValue,
        metrics,
      };
    });

    // Determine winner (simplified - would need statistical significance testing)
    const winner = this.determineWinner(variantResults);

    return {
      variantResults,
      winner: winner?.variantId,
      confidence: winner?.confidence,
      significantDifference: winner !== null,
    };
  }

  // Determine winner (simplified version)
  private determineWinner(results: VariantResults[]): { variantId: string; confidence: number } | null {
    if (results.length < 2) return null;

    // Find variant with highest conversion rate
    const sorted = [...results].sort((a, b) => 
      (b.conversionRate || 0) - (a.conversionRate || 0)
    );

    const winner = sorted[0];
    const runnerUp = sorted[1];

    // Simple confidence calculation (would need proper statistical test)
    const minExposures = 100;
    if (winner.exposures < minExposures || runnerUp.exposures < minExposures) {
      return null;
    }

    const difference = (winner.conversionRate || 0) - (runnerUp.conversionRate || 0);
    const confidence = Math.min(95, (difference / (winner.conversionRate || 1)) * 100);

    if (confidence < 80) return null; // Not confident enough

    return { variantId: winner.variantId, confidence };
  }

  // Hash function
  private hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Get results
  getResults(testId: string): ABTestResults | undefined {
    return this.calculateResults(testId);
  }

  // Export data
  export(testId: string): any {
    const test = this.tests.get(testId);
    const assignments = this.assignments.get(testId);
    const events = this.events.get(testId);

    return {
      test,
      assignments: Array.from(assignments?.entries() || []),
      events,
    };
  }
}

export const abTestManager = ABTestManager.getInstance();
