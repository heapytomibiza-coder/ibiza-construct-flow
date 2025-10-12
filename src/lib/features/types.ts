/**
 * Feature Flags Types
 * Phase 32: Advanced Feature Flags & Configuration System
 */

export type FeatureFlagStatus = 'enabled' | 'disabled' | 'conditional';
export type RolloutStrategy = 'immediate' | 'percentage' | 'gradual' | 'targeted';
export type ABTestStatus = 'draft' | 'running' | 'paused' | 'completed';
export type ConfigScope = 'global' | 'user' | 'tenant' | 'session';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  status: FeatureFlagStatus;
  enabled: boolean;
  rollout?: RolloutConfig;
  conditions?: FlagCondition[];
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface RolloutConfig {
  strategy: RolloutStrategy;
  percentage?: number; // 0-100
  startDate?: Date;
  endDate?: Date;
  targetUsers?: string[];
  targetSegments?: string[];
  gradualSteps?: GradualStep[];
}

export interface GradualStep {
  percentage: number;
  date: Date;
  completed?: boolean;
}

export interface FlagCondition {
  id: string;
  type: 'user' | 'segment' | 'date' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  field: string;
  value: any;
  negate?: boolean;
}

export interface ABTest {
  id: string;
  name: string;
  description?: string;
  featureKey: string;
  status: ABTestStatus;
  variants: Variant[];
  targetPercentage: number; // Percentage of users in test
  winningVariant?: string;
  startDate?: Date;
  endDate?: Date;
  metrics: TestMetric[];
  results?: ABTestResults;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Variant {
  id: string;
  name: string;
  description?: string;
  weight: number; // 0-100
  config?: Record<string, any>;
  enabled: boolean;
}

export interface TestMetric {
  id: string;
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'custom';
  goal: 'maximize' | 'minimize';
  target?: number;
}

export interface ABTestResults {
  variantResults: VariantResults[];
  winner?: string;
  confidence?: number; // 0-100
  significantDifference: boolean;
  completedAt?: Date;
}

export interface VariantResults {
  variantId: string;
  exposures: number;
  conversions?: number;
  conversionRate?: number;
  revenue?: number;
  avgValue?: number;
  metrics: Record<string, number>;
}

export interface UserSegment {
  id: string;
  name: string;
  description?: string;
  conditions: SegmentCondition[];
  userCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  type?: 'string' | 'number' | 'boolean' | 'date';
}

export interface Configuration {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  scope: ConfigScope;
  description?: string;
  validation?: ConfigValidation;
  encrypted?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ConfigValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

export interface FeatureContext {
  userId?: string;
  userAttributes?: Record<string, any>;
  segments?: string[];
  customAttributes?: Record<string, any>;
  timestamp?: Date;
}

export interface FlagEvaluation {
  flagKey: string;
  enabled: boolean;
  variant?: string;
  reason: string;
  context?: FeatureContext;
  evaluatedAt: Date;
}

export interface FeatureEvent {
  type: 'flag_evaluated' | 'variant_assigned' | 'conversion' | 'metric_tracked';
  flagKey?: string;
  variantId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface RemoteConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  flags: Record<string, FeatureFlag>;
  configs: Record<string, Configuration>;
  segments: Record<string, UserSegment>;
  lastSync: Date;
}
