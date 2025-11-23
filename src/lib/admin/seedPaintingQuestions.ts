/**
 * Seed Painting & Decorating Question Packs
 * Inserts question packs for all 8 interior painting micro-services
 */

import { supabase } from '@/integrations/supabase/client';
import { paintingQuestionPacks } from '@/lib/data/paintingQuestionTemplates';

export interface SeedResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ microSlug: string; error: string }>;
}

export async function seedPaintingQuestions(): Promise<SeedResult> {
  const result: SeedResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (const pack of paintingQuestionPacks) {
    try {
      // 1. Verify micro-service exists
      const { data: microService, error: microError } = await supabase
        .from('service_micro_categories')
        .select('id, slug')
        .eq('slug', pack.microSlug)
        .single();

      if (microError || !microService) {
        result.failed++;
        result.errors.push({
          microSlug: pack.microSlug,
          error: `Micro-service not found: ${pack.microSlug}`,
        });
        continue;
      }

      // 2. Check if pack already exists
      const { data: existing } = await supabase
        .from('question_packs')
        .select('pack_id')
        .eq('micro_slug', pack.microSlug)
        .eq('version', 1)
        .maybeSingle();

      if (existing) {
        result.skipped++;
        continue;
      }

      // 3. Insert question pack
      const { error: insertError } = await supabase
        .from('question_packs')
        .insert({
          micro_slug: pack.microSlug,
          version: 1,
          status: 'approved',
          source: 'manual',
          is_active: true,
          content: pack.content as any,
        });

      if (insertError) {
        result.failed++;
        result.errors.push({
          microSlug: pack.microSlug,
          error: insertError.message,
        });
      } else {
        result.success++;
      }
    } catch (error) {
      result.failed++;
      result.errors.push({
        microSlug: pack.microSlug,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}
