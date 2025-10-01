/**
 * Question packs resolution and utilities
 * DB-first with AI fallback strategy
 */

import { supabase } from '@/integrations/supabase/client';
import { MicroserviceDef, Pack } from '@/types/packs';
import { PackSchema } from '@/schemas/packs';

/**
 * Get the active approved pack for a microservice slug
 * This is the primary source of truth for question rendering
 */
export async function getActiveApprovedPack(slug: string): Promise<MicroserviceDef | null> {
  try {
    const { data, error } = await supabase
      .from('question_packs')
      .select('*')
      .eq('micro_slug', slug)
      .eq('status', 'approved')
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    const parsed = PackSchema.safeParse(data);
    return parsed.success ? parsed.data.content : null;
  } catch {
    return null;
  }
}

/**
 * Get the latest draft AI pack for admin review
 */
export async function getLatestDraftPack(slug: string): Promise<Pack | null> {
  try {
    const { data, error } = await supabase
      .from('question_packs')
      .select('*')
      .eq('micro_slug', slug)
      .eq('status', 'draft')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    const parsed = PackSchema.safeParse(data);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Resolve questions for a microservice
 * Priority: active approved pack > legacy snapshot > AI generation > fallback
 */
export async function resolveQuestions(
  slug: string,
  category: string,
  legacyFallback: () => Promise<any>
): Promise<any> {
  // 1. Try active approved pack (NEW)
  const pack = await getActiveApprovedPack(slug);
  if (pack) {
    console.log('[Packs] Using active approved pack for', slug);
    return pack.questions;
  }

  // 2. Fall back to legacy resolution
  console.log('[Packs] No active pack, using legacy resolution for', slug);
  return legacyFallback();
}

/**
 * Check if a question should be visible based on visibility rules
 */
export function shouldShowQuestion(
  visibility: any,
  answers: Record<string, any>
): boolean {
  if (!visibility) return true;

  const checkCondition = (cond: { questionKey: string; equals: any }) =>
    answers[cond.questionKey] === cond.equals;

  if (visibility.not) {
    return !shouldShowQuestion(visibility.not, answers);
  }

  const allOk = !visibility.allOf || visibility.allOf.every(checkCondition);
  const anyOk = !visibility.anyOf || visibility.anyOf.some(checkCondition);

  return allOk && anyOk;
}

/**
 * Track question metrics for analytics
 */
export async function trackQuestionMetric(
  packId: string,
  slug: string,
  questionKey: string,
  event: 'view' | 'answer' | 'dropoff',
  timeMs?: number
) {
  try {
    const { data: existing } = await supabase
      .from('question_metrics')
      .select('*')
      .eq('pack_id', packId)
      .eq('question_key', questionKey)
      .single();

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (event === 'view') updates.views = (existing?.views || 0) + 1;
    if (event === 'answer') updates.answers = (existing?.answers || 0) + 1;
    if (event === 'dropoff') updates.dropoffs = (existing?.dropoffs || 0) + 1;
    if (timeMs) {
      const totalTime = (existing?.avg_time_ms || 0) * (existing?.answers || 0);
      updates.avg_time_ms = Math.round((totalTime + timeMs) / ((existing?.answers || 0) + 1));
    }

    await supabase
      .from('question_metrics')
      .upsert({
        pack_id: packId,
        slug,
        question_key: questionKey,
        ...updates,
      });
  } catch (error) {
    console.error('[Packs] Failed to track metric:', error);
  }
}
