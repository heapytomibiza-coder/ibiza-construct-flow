import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { gardeningLandscapingQuestionPacks } from '../_shared/gardeningLandscapingQuestionPacks.ts';

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

    console.log(`Starting to seed ${gardeningLandscapingQuestionPacks.length} Gardening & Landscaping packs...`);

    let inserted = 0;
    let skipped = 0;
    const errors: Array<{ slug: string; error: string }> = [];

    for (const pack of gardeningLandscapingQuestionPacks) {
      try {
        // Lookup micro-service from service_micro_categories
        const { data: micro, error: microError } = await supabase
          .from('service_micro_categories')
          .select('id, name')
          .eq('slug', pack.microSlug)
          .maybeSingle();

        if (!micro) {
          errors.push({ slug: pack.microSlug, error: 'Micro-service not found' });
          skipped++;
          continue;
        }

        // Build content
        const content = {
          id: micro.id,
          category: 'gardening-landscaping',
          name: micro.name,
          slug: pack.microSlug,
          i18nPrefix: `gardening-landscaping.${pack.subcategorySlug}.${pack.microSlug}`,
          questions: pack.questions
        };

        // Upsert to question_packs
        const { error: upsertError } = await supabase
          .from('question_packs')
          .upsert({
            micro_slug: pack.microSlug,
            version: 1,
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
      success: true,
      total: gardeningLandscapingQuestionPacks.length,
      inserted,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(err) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
