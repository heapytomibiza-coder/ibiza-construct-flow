import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handymanQuestionPacks } from "../_shared/handymanQuestionPacks.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[seed-handyman-questions] Starting to seed ${handymanQuestionPacks.length} question packs...`);

    let inserted = 0;
    let skipped = 0;
    const errors: Array<{ slug: string; error: string }> = [];

    for (const pack of handymanQuestionPacks) {
      try {
        // 1. Lookup micro-service UUID from service_micro_categories
        const { data: micro, error: microError } = await supabase
          .from('service_micro_categories')
          .select('id, name, subcategory_id')
          .eq('slug', pack.slug)
          .maybeSingle();

        if (microError) {
          console.error(`[seed-handyman-questions] Error looking up micro: ${pack.slug}`, microError);
          errors.push({ slug: pack.slug, error: microError.message });
          skipped++;
          continue;
        }

        if (!micro) {
          console.warn(`[seed-handyman-questions] Micro-service not found: ${pack.slug}`);
          errors.push({ slug: pack.slug, error: 'Micro-service not found in database' });
          skipped++;
          continue;
        }

        // 2. Build content matching MicroserviceDef structure
        const content = {
          id: micro.id,
          category: 'handyman-general-services',
          name: micro.name,
          slug: pack.slug,
          i18nPrefix: `handyman-general-services.${pack.subcategorySlug}.${pack.slug}`,
          questions: pack.questions.map((q: any, index: number) => ({
            key: q.id,
            type: q.type,
            i18nKey: `${pack.slug}.${q.id}`,
            required: q.required || false,
            options: q.options?.map((opt: any, optIndex: number) => ({
              i18nKey: `${pack.slug}.${q.id}.options.${opt.value}`,
              value: opt.value,
              order: optIndex
            })),
            placeholder: q.placeholder,
            helpText: q.helpText,
            accept: q.accept
          }))
        };

        // 3. Upsert into question_packs
        const { error: insertError } = await supabase
          .from('question_packs')
          .upsert(
            {
              micro_slug: pack.slug,
              version: 1,
              status: 'approved',
              source: 'manual',
              content: content,
              is_active: true
            },
            {
              onConflict: 'micro_slug,version'
            }
          );

        if (insertError) {
          console.error(`[seed-handyman-questions] Error inserting pack: ${pack.slug}`, insertError);
          errors.push({ slug: pack.slug, error: insertError.message });
          skipped++;
        } else {
          console.log(`[seed-handyman-questions] ✅ Inserted: ${pack.slug}`);
          inserted++;
        }
      } catch (err: any) {
        console.error(`[seed-handyman-questions] Exception for ${pack.slug}:`, err);
        errors.push({ slug: pack.slug, error: err.message });
        skipped++;
      }
    }

    console.log(`[seed-handyman-questions] Seeding complete: ${inserted} inserted, ${skipped} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        skipped,
        errors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (err: any) {
    console.error('[seed-handyman-questions] Fatal error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err?.message || 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
