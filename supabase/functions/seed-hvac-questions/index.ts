import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { hvacQuestionPacks } from '../_shared/hvacQuestionPacks.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`Starting to seed ${hvacQuestionPacks.length} HVAC packs...`);

    let inserted = 0;
    let skipped = 0;
    const errors: Array<{ slug: string; error: string }> = [];

    for (const pack of hvacQuestionPacks) {
      try {
        // Lookup micro-service from service_micro_categories
        const { data: micro, error: microError } = await supabase
          .from('service_micro_categories')
          .select('id, name')
          .eq('slug', pack.microSlug)
          .maybeSingle();

        if (microError || !micro) {
          errors.push({ 
            slug: pack.microSlug, 
            error: microError?.message || 'Micro-service not found in taxonomy' 
          });
          skipped++;
          continue;
        }

        // Build content
        const content = {
          id: micro.id,
          category: pack.categorySlug,
          subcategory: pack.subcategorySlug,
          name: micro.name,
          slug: pack.microSlug,
          i18nPrefix: `hvac.${pack.subcategorySlug}.${pack.microSlug}`,
          questions: pack.questions
        };

        // Upsert to question_packs
        const { error: upsertError } = await supabase
          .from('question_packs')
          .upsert({
            micro_slug: pack.microSlug,
            version: pack.version,
            status: 'approved',
            source: 'manual',
            is_active: true,
            content
          }, { onConflict: 'micro_slug,version' });

        if (upsertError) {
          errors.push({ slug: pack.microSlug, error: upsertError.message });
          skipped++;
          continue;
        }

        inserted++;
        console.log(`✅ Seeded: ${pack.microSlug}`);

      } catch (err) {
        errors.push({ slug: pack.microSlug, error: String(err) });
        skipped++;
      }
    }

    return new Response(JSON.stringify({
      success: errors.length === 0,
      total: hvacQuestionPacks.length,
      inserted,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Fatal error:', err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(err) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
