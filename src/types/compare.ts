/**
 * Extended types for question pack comparison system
 */

import { Pack, QuestionDef } from './packs';

export interface QuestionDiff {
  key: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
  active?: QuestionDef;
  draft?: QuestionDef;
  changes?: {
    type?: boolean;
    required?: boolean;
    options?: boolean;
    visibility?: boolean;
    aiHint?: boolean;
  };
}

export interface ContentDiff {
  questionsCount: {
    active: number;
    draft: number;
    delta: number;
  };
  questions: QuestionDiff[];
  addedQuestions: string[];
  removedQuestions: string[];
  changedQuestions: string[];
}

export interface PackHealthCheck {
  schemaValid: boolean;
  schemaErrors?: string[];
  i18nCoverage: {
    en: number; // 0..1
    es: number;
    missingKeys: string[];
  };
  patternCompliance: {
    valid: boolean;
    expectedSlots: string[];
    mappedSlots: string[];
    unmappedQuestions: string[];
  };
  forbiddenTopics: {
    hasLocationQuestions: boolean;
    hasDateQuestions: boolean;
    hasBudgetQuestions: boolean;
    violations: string[];
  };
}

export interface RiskFlags {
  questionCountInvalid: boolean; // not 6-8
  hasFreeTextQuestions: boolean;
  missingI18nKeys: boolean;
  visibilityRulesChanged: boolean;
  largePayloadSize: boolean; // > 50kb
  severity: 'low' | 'medium' | 'high';
  messages: string[];
}

export interface UsageMetrics {
  pack_id: string;
  period: '30d' | '90d';
  completionRate: number; // 0..1
  medianDurationS: number;
  dropoffsByStep: Record<string, number>; // { q1: 0.05, q2: 0.08 }
  answerDistribution: Record<string, Array<{ value: string; share: number }>>;
  mobileVsDesktop?: {
    mobile: number;
    desktop: number;
  };
  renderLatency?: {
    p50: number;
    p95: number;
  };
}

export interface PackComparison {
  slug: string;
  active: Pack | null;
  draft: Pack | null;
  contentDiff: ContentDiff | null;
  activeHealth: PackHealthCheck | null;
  draftHealth: PackHealthCheck | null;
  activeMetrics: UsageMetrics | null;
  riskFlags: RiskFlags | null;
  versionHistory: Array<{
    version: number;
    status: string;
    created_at: string;
    activated_at?: string;
  }>;
}
