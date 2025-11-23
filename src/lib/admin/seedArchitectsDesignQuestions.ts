/**
 * Seed Architects & Design Question Packs
 * 6 micro-services: 3D Visualization, Space Planning, House Extension Plans,
 * Planning Drawings, Load Assessment, Structural Calculations
 */

import { supabase } from '@/integrations/supabase/client';
import { architectsDesignQuestionPacks } from '@/lib/data/architectsDesignQuestionTemplates';
import type { MicroserviceDef } from '@/types/packs';

interface SeedResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
  details: Array<{
    slug: string;
    status: 'success' | 'failed' | 'skipped';
    message?: string;
  }>;
}

/**
 * Seed question packs for Architects & Design services
 */
export async function seedArchitectsDesignQuestions(): Promise<SeedResult> {
  const result: SeedResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    details: []
  };

  console.log('🌱 Starting Architects & Design question pack seeding...');
  console.log(`📦 Total packs to seed: ${architectsDesignQuestionPacks.length}`);

  for (const pack of architectsDesignQuestionPacks) {
    try {
      console.log(`\n🔍 Processing: ${pack.name} (${pack.slug})`);

      // 1. Verify the micro-service exists in service_micro_categories
      const { data: microService, error: microError } = await supabase
        .from('service_micro_categories')
        .select('id, name, slug')
        .eq('slug', pack.slug)
        .single();

      if (microError || !microService) {
        console.error(`❌ Micro-service not found: ${pack.slug}`);
        result.failed++;
        result.errors.push(`Micro-service not found: ${pack.slug}`);
        result.details.push({
          slug: pack.slug,
          status: 'failed',
          message: 'Micro-service not found in database'
        });
        continue;
      }

      console.log(`✅ Found micro-service: ${microService.name}`);

      // 2. Check if question pack already exists
      const { data: existingPack, error: checkError } = await supabase
        .from('question_packs')
        .select('pack_id, version, is_active')
        .eq('micro_slug', pack.slug)
        .eq('is_active', true)
        .maybeSingle();

      if (checkError) {
        console.error(`❌ Error checking existing pack:`, checkError);
        result.failed++;
        result.errors.push(`Error checking ${pack.slug}: ${checkError.message}`);
        result.details.push({
          slug: pack.slug,
          status: 'failed',
          message: checkError.message
        });
        continue;
      }

      if (existingPack) {
        console.log(`⏭️  Pack already exists (version ${existingPack.version}), skipping...`);
        result.skipped++;
        result.details.push({
          slug: pack.slug,
          status: 'skipped',
          message: `Already exists (v${existingPack.version})`
        });
        continue;
      }

      // 3. Transform questions to database format
      const content: MicroserviceDef = {
        id: pack.id,
        category: pack.category,
        name: pack.name,
        slug: pack.slug,
        i18nPrefix: pack.i18nPrefix,
        questions: pack.questions.map(q => ({
          key: q.key,
          type: q.type,
          i18nKey: q.i18nKey,
          required: q.required,
          options: q.options,
          aiHint: q.aiHint
        }))
      };

      // 4. Insert question pack
      const { error: insertError } = await supabase
        .from('question_packs')
        .insert({
          micro_slug: pack.slug,
          version: 1,
          status: 'approved',
          source: 'manual',
          is_active: true,
          content: content as any,
          created_by: null
        });

      if (insertError) {
        console.error(`❌ Failed to insert pack:`, insertError);
        result.failed++;
        result.errors.push(`Failed to insert ${pack.slug}: ${insertError.message}`);
        result.details.push({
          slug: pack.slug,
          status: 'failed',
          message: insertError.message
        });
        continue;
      }

      console.log(`✅ Successfully seeded: ${pack.name}`);
      result.success++;
      result.details.push({
        slug: pack.slug,
        status: 'success',
        message: `Created v1 with ${pack.questions.length} questions`
      });

    } catch (error) {
      console.error(`❌ Unexpected error processing ${pack.slug}:`, error);
      result.failed++;
      result.errors.push(`Unexpected error for ${pack.slug}: ${error}`);
      result.details.push({
        slug: pack.slug,
        status: 'failed',
        message: 'Unexpected error'
      });
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`✅ Success: ${result.success}`);
  console.log(`❌ Failed: ${result.failed}`);
  console.log(`⏭️  Skipped: ${result.skipped}`);

  return result;
}
