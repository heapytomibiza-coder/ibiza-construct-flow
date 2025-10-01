/**
 * Canonical types for question packs system
 * Shared by UI, API, and database layers
 */

export type PackStatus = 'draft' | 'approved' | 'retired';
export type PackSource = 'manual' | 'ai' | 'hybrid';
export type QuestionType = 'single' | 'multi' | 'scale' | 'text' | 'number' | 'yesno';

export interface QuestionOption {
  i18nKey: string;      // 'tiler.floor.q1.options.kitchen'
  value: string;        // 'kitchen'
  order: number;
}

export interface VisibilityCondition {
  questionKey: string;
  equals: string | number | boolean;
}

export interface VisibilityRule {
  anyOf?: VisibilityCondition[];
  allOf?: VisibilityCondition[];
  not?: VisibilityRule;
}

export interface QuestionDef {
  key: string;               // 'q1'
  type: QuestionType;
  i18nKey: string;           // 'tiler.floor.q1.title'
  required?: boolean;
  options?: QuestionOption[];
  visibility?: VisibilityRule;
  aiHint?: string;           // short tag to help the composer
}

export interface MicroserviceDef {
  id: string;                // uuid string
  category: string;
  name: string;
  slug: string;              // 'tiler-floor-tiling'
  i18nPrefix: string;        // 'tiler.floor'
  questions: QuestionDef[];  // 6–8 typical
}

export interface Pack {
  pack_id: string;
  micro_slug: string;
  version: number;
  status: PackStatus;
  source: PackSource;
  prompt_hash?: string | null;
  content: MicroserviceDef;
  created_by?: string | null;
  created_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  is_active: boolean;
  ab_test_id?: string | null;
}

export interface QuestionMetrics {
  slug: string;
  pack_id: string;
  question_key: string;
  views: number;
  answers: number;
  dropoffs: number;
  avg_time_ms: number;
  updated_at: string;
}

export interface PackPerformance {
  slug: string;
  pack_id: string;
  completion_rate: number;   // 0..1
  median_duration_s: number;
  created_at: string;
}
