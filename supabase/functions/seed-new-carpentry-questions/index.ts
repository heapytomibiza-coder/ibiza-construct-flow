/**
 * Seed New Question Packs - Batch 1
 * Inserts 22 question packs: Carpentry (17) + Floors/Doors/Windows (5)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { newCarpentryQuestionPacks } from '../_shared/newCarpentryPacks.ts';

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

    console.log(`[seed-new-carpentry] Starting to seed ${newCarpentryQuestionPacks.length} question packs...`);

    let inserted = 0;
    let skipped = 0;
    const errors: Array<{ slug: string; error: string }> = [];

    for (const pack of newCarpentryQuestionPacks) {
      try {
        // 1. Lookup micro-service UUID from service_micro_categories
        const { data: micro, error: microError } = await supabase
          .from('service_micro_categories')
          .select('id, name, subcategory_id')
          .eq('slug', pack.microSlug)
          .maybeSingle();

        if (microError) {
          console.error(`[seed-new-carpentry] Error looking up micro: ${pack.microSlug}`, microError);
          errors.push({ slug: pack.microSlug, error: microError.message });
          skipped++;
          continue;
        }

        if (!micro) {
          console.warn(`[seed-new-carpentry] Micro-service not found: ${pack.microSlug}`);
          errors.push({ slug: pack.microSlug, error: 'Micro-service not found in database' });
          skipped++;
          continue;
        }

        // 2. Build content matching MicroserviceDef structure
        const content = {
          id: micro.id,
          category: pack.categorySlug,
          name: micro.name,
          slug: pack.microSlug,
          i18nPrefix: `${pack.categorySlug}.${pack.subcategorySlug}.${pack.microSlug}`,
          questions: pack.questions
        };

        // 3. Upsert to question_packs table
        const { error: upsertError } = await supabase
          .from('question_packs')
          .upsert({
            micro_slug: pack.microSlug,
            version: 1,
            status: 'approved',
            source: 'manual',
            is_active: true,
            content
          }, { 
            onConflict: 'micro_slug,version' 
          });

        if (upsertError) {
          console.error(`[seed-new-carpentry] Upsert error for ${pack.microSlug}:`, upsertError);
          errors.push({ slug: pack.microSlug, error: upsertError.message });
          skipped++;
          continue;
        }

        inserted++;
        console.log(`[seed-new-carpentry] ✅ Seeded: ${pack.microSlug} (${pack.questions.length} questions)`);

      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[seed-new-carpentry] Exception for ${pack.microSlug}:`, errMsg);
        errors.push({ slug: pack.microSlug, error: errMsg });
        skipped++;
      }
    }

    const result = {
      success: true,
      total: newCarpentryQuestionPacks.length,
      inserted,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('[seed-new-carpentry] Complete:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[seed-new-carpentry] Fatal error:', err);
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
