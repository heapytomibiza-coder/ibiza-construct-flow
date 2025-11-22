/**
 * Seed Floors, Doors & Windows Question Packs
 * Bulk inserts all Floors, Doors & Windows micro-service question packs into the database
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { floorsDoorsWindowsQuestionPacks } from '../_shared/floorsDoorsWindowsQuestionPacks.ts';

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

    console.log(`[seed-floors-doors-windows-questions] Starting to seed ${floorsDoorsWindowsQuestionPacks.length} question packs...`);

    let inserted = 0;
    let skipped = 0;
    const errors: Array<{ slug: string; error: string }> = [];

    for (const pack of floorsDoorsWindowsQuestionPacks) {
      try {
        // 1. Lookup micro-service UUID from service_micro_categories
        const { data: micro, error: microError } = await supabase
          .from('service_micro_categories')
          .select('id, name, subcategory_id')
          .eq('slug', pack.slug)
          .maybeSingle();

        if (microError) {
          console.error(`[seed-floors-doors-windows-questions] Error looking up micro: ${pack.slug}`, microError);
          errors.push({ slug: pack.slug, error: microError.message });
          skipped++;
          continue;
        }

        if (!micro) {
          console.warn(`[seed-floors-doors-windows-questions] Micro-service not found: ${pack.slug}`);
          errors.push({ slug: pack.slug, error: 'Micro-service not found in database' });
          skipped++;
          continue;
        }

        // 2. Build content matching MicroserviceDef structure
        const content = {
          id: micro.id,
          category: 'floors-doors-windows',
          name: micro.name,
          slug: pack.slug,
          i18nPrefix: `floors-doors-windows.${pack.subcategorySlug}.${pack.slug}`,
          questions: pack.questions.map((q, index) => ({
            key: q.id,
            type: q.type === 'textarea' ? 'text' : 
                  q.type === 'select' || q.type === 'radio' ? 'single' :
                  q.type === 'checkbox' ? 'multi' :
                  q.type === 'number' ? 'number' :
                  q.type === 'file' ? 'file' : 'text',
            i18nKey: `floors-doors-windows.${pack.subcategorySlug}.${pack.slug}.q${index + 1}`,
            required: q.required || false,
            options: q.options?.map((opt, optIndex) => ({
              i18nKey: `floors-doors-windows.${pack.subcategorySlug}.${pack.slug}.q${index + 1}.options.${opt.value}`,
              value: opt.value,
              order: optIndex
            }))
          }))
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
          console.error(`[seed-floors-doors-windows-questions] Upsert error for ${pack.slug}:`, upsertError);
          errors.push({ slug: pack.slug, error: upsertError.message });
          skipped++;
          continue;
        }

        inserted++;
        console.log(`[seed-floors-doors-windows-questions] ✅ Seeded: ${pack.slug} (${pack.questions.length} questions)`);

      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[seed-floors-doors-windows-questions] Exception for ${pack.slug}:`, errMsg);
        errors.push({ slug: pack.slug, error: errMsg });
        skipped++;
      }
    }

    const result = {
      success: true,
      total: floorsDoorsWindowsQuestionPacks.length,
      inserted,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('[seed-floors-doors-windows-questions] Complete:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[seed-floors-doors-windows-questions] Fatal error:', err);
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
