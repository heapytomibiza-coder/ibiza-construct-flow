/**
 * Feature Flag Manager
 * Phase 32: Advanced Feature Flags & Configuration System
 * 
 * Manages feature flags and conditional rollouts
 */

import { FeatureFlag, FeatureContext, FlagEvaluation, FlagCondition } from './types';

export class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private flags: Map<string, FeatureFlag> = new Map();
  private evaluationCache: Map<string, FlagEvaluation> = new Map();
  private cacheTimeout: number = 60000; // 1 minute

  private constructor() {}

  static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }

  // Create or update flag
  setFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
    this.clearCache(flag.key);
  }

  // Get flag
  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  // Get all flags
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  // Delete flag
  deleteFlag(key: string): boolean {
    this.clearCache(key);
    return this.flags.delete(key);
  }

  // Check if feature is enabled
  isEnabled(key: string, context?: FeatureContext): boolean {
    const evaluation = this.evaluate(key, context);
    return evaluation.enabled;
  }

  // Evaluate flag with context
  evaluate(key: string, context?: FeatureContext): FlagEvaluation {
    // Check cache
    const cacheKey = this.getCacheKey(key, context);
    const cached = this.evaluationCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    const flag = this.flags.get(key);
    
    if (!flag) {
      return {
        flagKey: key,
        enabled: false,
        reason: 'flag_not_found',
        context,
        evaluatedAt: new Date(),
      };
    }

    if (!flag.enabled) {
      return this.cacheEvaluation(cacheKey, {
        flagKey: key,
        enabled: false,
        reason: 'flag_disabled',
        context,
        evaluatedAt: new Date(),
      });
    }

    // Check conditions
    if (flag.conditions && flag.conditions.length > 0) {
      const conditionsMet = this.evaluateConditions(flag.conditions, context);
      if (!conditionsMet) {
        return this.cacheEvaluation(cacheKey, {
          flagKey: key,
          enabled: false,
          reason: 'conditions_not_met',
          context,
          evaluatedAt: new Date(),
        });
      }
    }

    // Check rollout
    if (flag.rollout) {
      const rolloutEnabled = this.evaluateRollout(flag, context);
      return this.cacheEvaluation(cacheKey, {
        flagKey: key,
        enabled: rolloutEnabled,
        reason: rolloutEnabled ? 'rollout_enabled' : 'rollout_not_targeted',
        context,
        evaluatedAt: new Date(),
      });
    }

    // Default enabled
    return this.cacheEvaluation(cacheKey, {
      flagKey: key,
      enabled: true,
      reason: 'default_enabled',
      context,
      evaluatedAt: new Date(),
    });
  }

  // Evaluate conditions
  private evaluateConditions(conditions: FlagCondition[], context?: FeatureContext): boolean {
    if (!context) return false;

    return conditions.every(condition => {
      const result = this.evaluateCondition(condition, context);
      return condition.negate ? !result : result;
    });
  }

  // Evaluate single condition
  private evaluateCondition(condition: FlagCondition, context: FeatureContext): boolean {
    let value: any;

    switch (condition.type) {
      case 'user':
        value = context.userId;
        break;
      case 'segment':
        value = context.segments || [];
        break;
      case 'date':
        value = context.timestamp || new Date();
        break;
      case 'custom':
        value = context.customAttributes?.[condition.field];
        break;
      default:
        return false;
    }

    return this.compareValues(value, condition.operator, condition.value);
  }

  // Compare values based on operator
  private compareValues(actual: any, operator: FlagCondition['operator'], expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'contains':
        return String(actual).includes(String(expected));
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(actual);
      default:
        return false;
    }
  }

  // Evaluate rollout strategy
  private evaluateRollout(flag: FeatureFlag, context?: FeatureContext): boolean {
    if (!flag.rollout) return true;

    const { strategy, percentage, targetUsers, targetSegments, startDate, endDate } = flag.rollout;

    // Check date range
    const now = new Date();
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;

    switch (strategy) {
      case 'immediate':
        return true;

      case 'percentage':
        if (!percentage) return false;
        return this.isInPercentage(flag.key, context?.userId, percentage);

      case 'targeted':
        if (targetUsers && context?.userId) {
          if (targetUsers.includes(context.userId)) return true;
        }
        if (targetSegments && context?.segments) {
          if (context.segments.some(s => targetSegments.includes(s))) return true;
        }
        return false;

      case 'gradual':
        if (!flag.rollout.gradualSteps) return false;
        const currentStep = this.getCurrentGradualStep(flag.rollout.gradualSteps);
        if (!currentStep) return false;
        return this.isInPercentage(flag.key, context?.userId, currentStep.percentage);

      default:
        return false;
    }
  }

  // Check if user is in percentage rollout
  private isInPercentage(flagKey: string, userId?: string, percentage?: number): boolean {
    if (percentage === undefined) return false;
    if (percentage >= 100) return true;
    if (percentage <= 0) return false;

    // Use consistent hashing for stable rollout
    const hash = this.hash(`${flagKey}:${userId || 'anonymous'}`);
    const bucket = hash % 100;
    return bucket < percentage;
  }

  // Get current gradual rollout step
  private getCurrentGradualStep(steps: any[]): any {
    const now = new Date();
    const activeSteps = steps.filter(s => new Date(s.date) <= now);
    return activeSteps.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }

  // Simple hash function for consistent bucketing
  private hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Cache management
  private getCacheKey(flagKey: string, context?: FeatureContext): string {
    return `${flagKey}:${context?.userId || 'anonymous'}:${JSON.stringify(context?.segments || [])}`;
  }

  private cacheEvaluation(key: string, evaluation: FlagEvaluation): FlagEvaluation {
    this.evaluationCache.set(key, evaluation);
    return evaluation;
  }

  private isCacheValid(evaluation: FlagEvaluation): boolean {
    const age = Date.now() - evaluation.evaluatedAt.getTime();
    return age < this.cacheTimeout;
  }

  private clearCache(flagKey?: string): void {
    if (flagKey) {
      // Clear specific flag cache entries
      const keysToDelete: string[] = [];
      this.evaluationCache.forEach((_, key) => {
        if (key.startsWith(`${flagKey}:`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.evaluationCache.delete(key));
    } else {
      this.evaluationCache.clear();
    }
  }

  // Bulk operations
  setFlags(flags: FeatureFlag[]): void {
    flags.forEach(flag => this.setFlag(flag));
  }

  // Export/Import
  export(): Record<string, FeatureFlag> {
    const exported: Record<string, FeatureFlag> = {};
    this.flags.forEach((flag, key) => {
      exported[key] = flag;
    });
    return exported;
  }

  import(flags: Record<string, FeatureFlag>): void {
    Object.values(flags).forEach(flag => this.setFlag(flag));
  }
}

export const featureFlagManager = FeatureFlagManager.getInstance();
