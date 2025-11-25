import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { commercialOfficeQuestionPacks } from '../_shared/commercialOfficeQuestionPacks.ts';

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

    console.log(`🏪 Seeding ${commercialOfficeQuestionPacks.length} Commercial, Office, Retail, Kitchen/Bathroom, Storage, Extensions, Brickwork & Pool Heating question packs...`);

    const results = {
      success: [] as string[],
      failed: [] as { slug: string; error: string }[],
    };

    for (const pack of commercialOfficeQuestionPacks) {
      try {
        // 1. Look up microservice
        const { data: micro, error: microError } = await supabase
          .from('service_micro_categories')
          .select('id, slug')
          .eq('slug', pack.microSlug)
          .maybeSingle();

        if (microError) {
          console.error(`❌ DB error looking up micro ${pack.microSlug}:`, microError);
          results.failed.push({ slug: pack.microSlug, error: microError.message });
          continue;
        }

        if (!micro) {
          console.warn(`⚠️  Microservice not found: ${pack.microSlug}`);
          results.failed.push({ slug: pack.microSlug, error: 'Microservice not found in DB' });
          continue;
        }

        // 2. Build MicroserviceDef content
        const content = {
          id: crypto.randomUUID(),
          category: pack.categorySlug,
          name: pack.microSlug,
          slug: pack.microSlug,
          i18nPrefix: pack.microSlug.replace(/-/g, '.'),
          questions: pack.questions.map((q, idx) => ({
            key: `q${idx + 1}`,
            type: q.type === 'file' ? 'text' : q.type === 'textarea' ? 'text' : q.type === 'checkbox' ? 'multi' : q.type === 'radio' ? 'single' : q.type === 'select' ? 'single' : 'text',
            i18nKey: `${pack.microSlug}.q${idx + 1}.title`,
            required: q.required,
            ...(q.options && {
              options: q.options.map((opt, optIdx) => ({
                i18nKey: `${pack.microSlug}.q${idx + 1}.options.${opt.value}`,
                value: opt.value,
                order: optIdx,
              })),
            }),
          })),
        };

        // 3. Insert or update question_packs
        const { error: packError } = await supabase
          .from('question_packs')
          .upsert(
            {
              pack_id: crypto.randomUUID(),
              micro_slug: pack.microSlug,
              version: pack.version,
              status: 'approved',
              source: 'manual',
              content: content as any,
              is_active: true,
              created_at: new Date().toISOString(),
            },
            {
              onConflict: 'micro_slug,version',
              ignoreDuplicates: false,
            }
          );

        if (packError) {
          console.error(`❌ Failed to insert pack for ${pack.microSlug}:`, packError);
          results.failed.push({ slug: pack.microSlug, error: packError.message });
        } else {
          console.log(`✅ Seeded: ${pack.microSlug}`);
          results.success.push(pack.microSlug);
        }
      } catch (err: any) {
        console.error(`❌ Exception seeding ${pack.microSlug}:`, err);
        results.failed.push({ slug: pack.microSlug, error: err.message });
      }
    }

    console.log(`\n📊 Summary: ${results.success.length} succeeded, ${results.failed.length} failed`);

    return new Response(
      JSON.stringify({
        message: 'Commercial, Office, Retail, Kitchen/Bathroom, Storage, Extensions, Brickwork & Pool Heating question packs seeded',
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
