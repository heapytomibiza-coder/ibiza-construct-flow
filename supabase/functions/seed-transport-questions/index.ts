import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { json } from "../_shared/json.ts";
import { transportQuestionPacks, type QuestionDef } from "../_shared/transportQuestionPacks.ts";

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🚚 Seeding ${transportQuestionPacks.length} transport question packs...`);
    
    const results = { created: [], failed: [], skipped: [] } as any;

    for (const pack of transportQuestionPacks) {
      try {
        // 1. Check if microservice exists
        const { data: micro, error: microError } = await supabase
          .from('services_micro')
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
          questions: pack.questions.map((q: QuestionDef, idx: number) => ({
            key: `q${idx + 1}`,
            type: mapQuestionType(q.type),
            i18nKey: `${pack.microSlug.replace(/-/g, '.')}.q${idx + 1}.title`,
            required: q.required || false,
            ...(q.options && {
              options: q.options.map((opt: any, optIdx: number) => ({
                i18nKey: `${pack.microSlug.replace(/-/g, '.')}.q${idx + 1}.options.${opt.value}`,
                value: opt.value,
                order: optIdx
              }))
            })
          }))
        };

        // 3. Check if pack already exists
        const { data: existing } = await supabase
          .from('question_packs')
          .select('pack_id')
          .eq('micro_slug', pack.microSlug)
          .eq('is_active', true)
          .maybeSingle();

        if (existing) {
          console.log(`⏭️  Pack exists for ${pack.microSlug}`);
          results.skipped.push({ slug: pack.microSlug, pack_id: existing.pack_id });
          continue;
        }

        // 4. Insert pack
        const { data: inserted, error: insertError } = await supabase
          .from('question_packs')
          .insert({
            micro_slug: pack.microSlug,
            version: pack.version,
            status: 'approved',
            source: 'manual',
            content,
            is_active: true
          })
          .select('pack_id')
          .single();

        if (insertError) {
          console.error(`❌ Insert error for ${pack.microSlug}:`, insertError);
          results.failed.push({ slug: pack.microSlug, error: insertError.message });
        } else {
          console.log(`✅ Created pack for ${pack.microSlug}`);
          results.created.push({ slug: pack.microSlug, pack_id: inserted.pack_id });
        }

      } catch (err: any) {
        console.error(`❌ Error processing ${pack.microSlug}:`, err);
        results.failed.push({ slug: pack.microSlug, error: err.message });
      }
    }

    console.log(`\n📊 Summary: ${results.created.length} created, ${results.skipped.length} skipped, ${results.failed.length} failed`);
    
    return json({
      success: true,
      summary: {
        created: results.created.length,
        skipped: results.skipped.length,
        failed: results.failed.length
      },
      results
    });

  } catch (err: any) {
    console.error('❌ Fatal error:', err);
    return json({ error: err.message }, 500);
  }
});

function mapQuestionType(type: string): string {
  const typeMap: Record<string, string> = {
    'text': 'text',
    'textarea': 'text',
    'select': 'single',
    'radio': 'single',
    'checkbox': 'multi',
    'file': 'file'
  };
  return typeMap[type] || 'text';
}
