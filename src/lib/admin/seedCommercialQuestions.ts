/**
 * Utility to seed Commercial & Industrial question packs into the database
 * Run this from an admin page or console
 */

import { supabase } from '@/integrations/supabase/client';
import { commercialIndustrialQuestionPacks } from '@/lib/data/commercialIndustrialQuestionTemplates';

export async function seedCommercialQuestions() {
  console.log('🌱 Starting Commercial & Industrial question packs seeding...');
  
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[]
  };

  for (const pack of commercialIndustrialQuestionPacks) {
    try {
      // First, verify the micro-service exists
      const { data: microService, error: microError } = await supabase
        .from('service_micro_categories')
        .select('id, name')
        .eq('slug', pack.microSlug)
        .maybeSingle();

      if (microError) {
        results.errors.push(`DB error checking ${pack.microSlug}: ${microError.message}`);
        results.failed++;
        continue;
      }

      if (!microService) {
        results.errors.push(`Micro-service not found: ${pack.microSlug}`);
        results.skipped++;
        continue;
      }

      // Check if pack already exists
      const { data: existingPack } = await supabase
        .from('question_packs')
        .select('id, version')
        .eq('micro_slug', pack.microSlug)
        .eq('status', 'approved')
        .eq('is_active', true)
        .maybeSingle();

      if (existingPack) {
        console.log(`⏭️  Skipping ${pack.microSlug} - already exists`);
        results.skipped++;
        continue;
      }

      // Insert the question pack
      const { error: insertError } = await supabase
        .from('question_packs')
        .insert({
          micro_slug: pack.microSlug,
          version: pack.version,
          status: 'approved',
          source: 'manual',
          is_active: true,
          content: {
            questions: pack.questions.map(q => ({
              id: q.id,
              question: q.question,
              type: q.type,
              required: q.required || false,
              options: q.options?.map(opt => ({ label: opt, value: opt })),
              placeholder: q.placeholder,
              accept: q.accept,
              validation: q.validation,
              conditional: q.conditional,
              range: q.range
            }))
          },
          created_by: null // System seed
        });

      if (insertError) {
        results.errors.push(`Failed to insert ${pack.microSlug}: ${insertError.message}`);
        results.failed++;
        continue;
      }

      console.log(`✅ Seeded ${pack.microSlug} (${pack.questions.length} questions)`);
      results.success++;

    } catch (error: any) {
      results.errors.push(`Exception for ${pack.microSlug}: ${error.message}`);
      results.failed++;
    }
  }

  console.log('\n📊 Seeding Complete:');
  console.log(`  ✅ Success: ${results.success}`);
  console.log(`  ❌ Failed: ${results.failed}`);
  console.log(`  ⏭️  Skipped: ${results.skipped}`);
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    results.errors.forEach(err => console.log(`  - ${err}`));
  }

  return results;
}

/**
 * Seed taxonomy (categories, subcategories, micro-services)
 */
export async function seedCommercialTaxonomy() {
  console.log('🌱 Starting Commercial & Industrial taxonomy seeding...');
  
  const { commercialIndustrialSubcategories } = await import('@/lib/data/commercialIndustrialQuestionTemplates');
  
  // 1. Upsert the main category
  const { data: category, error: catError } = await supabase
    .from('service_categories')
    .upsert({
      name: 'Commercial & Industrial',
      slug: 'commercial-industrial',
      icon_name: 'Building2',
      is_active: true,
      is_featured: true,
      display_order: 10
    }, {
      onConflict: 'slug',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (catError) {
    console.error('❌ Failed to create category:', catError);
    return { success: false, error: catError };
  }

  console.log('✅ Category created/updated:', category.name);

  let subCount = 0;
  let microCount = 0;

  // 2. Upsert subcategories and their services
  for (const sub of commercialIndustrialSubcategories) {
    const { data: subcategory, error: subError } = await supabase
      .from('service_subcategories')
      .upsert({
        name: sub.name,
        slug: sub.slug,
        category_id: category.id,
        icon_name: sub.icon,
        is_active: true,
        display_order: subCount++
      }, {
        onConflict: 'slug',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (subError) {
      console.error(`❌ Failed to create subcategory ${sub.name}:`, subError);
      continue;
    }

    console.log(`  ✅ Subcategory: ${subcategory.name}`);

    // 3. Upsert micro-services
    for (const service of sub.services) {
      const { error: microError } = await supabase
        .from('service_micro_categories')
        .upsert({
          name: service.name,
          slug: service.slug,
          subcategory_id: subcategory.id,
          is_active: true,
          display_order: microCount++
        }, {
          onConflict: 'slug',
          ignoreDuplicates: false
        });

      if (microError) {
        console.error(`    ❌ Failed to create service ${service.name}:`, microError);
      } else {
        console.log(`    ✅ Service: ${service.name}`);
      }
    }
  }

  console.log('\n✅ Taxonomy seeding complete!');
  return { success: true, subCount, microCount };
}
