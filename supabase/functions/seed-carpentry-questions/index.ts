/**
 * Seed Carpentry Question Packs
 * Bulk inserts all 15 Carpentry micro-service question packs into the database
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { carpentryQuestionPacks } from '../_shared/carpentryQuestionPacks.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log(`[seed-carpentry-questions] Starting to seed ${carpentryQuestionPacks.length} question packs...`);

    let inserted = 0;
    let skipped = 0;
    const errors: Array<{ slug: string; error: string }> = [];

    for (const pack of carpentryQuestionPacks) {
      try {
        // 1. Lookup micro-service UUID from service_micro_categories
        const { data: micro, error: microError } = await supabase
          .from('service_micro_categories')
          .select('id, name, subcategory_id')
          .eq('slug', pack.slug)
          .maybeSingle();

        if (microError) {
          console.error(`[seed-carpentry-questions] Error looking up micro: ${pack.slug}`, microError);
          errors.push({ slug: pack.slug, error: microError.message });
          skipped++;
          continue;
        }

        if (!micro) {
          console.warn(`[seed-carpentry-questions] Micro-service not found: ${pack.slug}`);
          errors.push({ slug: pack.slug, error: 'Micro-service not found in database' });
          skipped++;
          continue;
        }

        // 2. Build content matching MicroserviceDef structure
        const content = {
          id: micro.id,
          category: 'carpentry',
          name: micro.name,
          slug: pack.slug,
          i18nPrefix: `carpentry.${pack.subcategorySlug}.${pack.slug}`,
          questions: pack.questions
        };

        // 3. Upsert to question_packs table
        const { error: upsertError } = await supabase
          .from('question_packs')
          .upsert({
            micro_slug: pack.slug,
            version: 1,
            status: 'approved',
            source: 'manual',
            is_active: true,
            content
          }, { 
            onConflict: 'micro_slug,version' 
          });

        if (upsertError) {
          console.error(`[seed-carpentry-questions] Upsert error for ${pack.slug}:`, upsertError);
          errors.push({ slug: pack.slug, error: upsertError.message });
          skipped++;
          continue;
        }

        inserted++;
        console.log(`[seed-carpentry-questions] ✅ Seeded: ${pack.slug} (${pack.questions.length} questions)`);

      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[seed-carpentry-questions] Exception for ${pack.slug}:`, errMsg);
        errors.push({ slug: pack.slug, error: errMsg });
        skipped++;
      }
    }

    const result = {
      success: true,
      total: carpentryQuestionPacks.length,
      inserted,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('[seed-carpentry-questions] Complete:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[seed-carpentry-questions] Fatal error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMsg 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
