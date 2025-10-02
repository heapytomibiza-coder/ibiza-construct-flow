/**
 * Shared types consistent with Zod/OpenAPI schemas
 */

export type PackStatus = 'draft' | 'approved' | 'retired';
export type PackSource = 'manual' | 'ai' | 'hybrid';
export type QuestionType = 'single' | 'multi' | 'scale' | 'text' | 'number' | 'yesno';

export interface QuestionOption { 
  i18nKey: string; 
  value: string; 
  order: number;
}

export interface VisibilityRule {
  anyOf?: Array<{ questionKey: string; equals: string | number | boolean }>;
  allOf?: Array<{ questionKey: string; equals: string | number | boolean }>;
  not?: VisibilityRule;
}

export interface QuestionDef {
  key: string; 
  type: QuestionType; 
  i18nKey: string;
  required?: boolean; 
  options?: QuestionOption[];
  visibility?: VisibilityRule; 
  aiHint?: string;
}

export interface MicroserviceDef {
  id: string; 
  category: string; 
  name: string; 
  slug: string; 
  i18nPrefix: string;
  questions: QuestionDef[];
}

export interface Pack {
  pack_id: string; 
  micro_slug: string; 
  version: number;
  status: PackStatus; 
  source: PackSource; 
  content: MicroserviceDef;
  created_by?: string | null; 
  created_at: string; 
  approved_at?: string | null;
  is_active: boolean;
}

export interface CompareMetrics {
  active?: {
    pack_id: string;
    completion_rate_30d: number;
    median_duration_s_30d: number;
    dropoffs_by_step_30d: Record<string, number>;
    answer_share_by_question_30d: Record<string, Array<{ value: string; share: number }>>;
    render_latency_ms_p50?: number;
    render_latency_ms_p95?: number;
  };
}

export interface UsageMetrics {
  pack_id: string;
  period: '30d' | '90d';
  completionRate: number;
  medianDurationS: number;
  dropoffsByStep: Record<string, number>;
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
  activeMetrics: UsageMetrics | null;
  versionHistory: Array<{
    version: number;
    status: string;
    created_at: string;
    activated_at?: string;
  }>;
}
