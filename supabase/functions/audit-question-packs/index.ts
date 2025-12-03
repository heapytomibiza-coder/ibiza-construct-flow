import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditResult {
  timestamp: string;
  summary: {
    total_packs: number;
    active_packs: number;
    issues_found: number;
    health_score: number;
  };
  issues: AuditIssue[];
  recommendations: string[];
}

interface AuditIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  affected_items: string[];
  fix_suggestion?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const issues: AuditIssue[] = [];
    const recommendations: string[] = [];

    // 1. Check for orphaned packs (no matching micro service)
    const { data: orphanedPacks } = await supabase
      .from('question_packs')
      .select('micro_slug, pack_id')
      .eq('is_active', true);

    const { data: microServices } = await supabase
      .from('service_micro_categories')
      .select('slug')
      .eq('is_active', true);

    const validSlugs = new Set(microServices?.map(m => m.slug) || []);
    const orphaned = orphanedPacks?.filter(p => !validSlugs.has(p.micro_slug)) || [];

    if (orphaned.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'orphaned_packs',
        message: `${orphaned.length} active packs have no matching active micro service`,
        affected_items: orphaned.map(p => p.micro_slug),
        fix_suggestion: 'Deactivate orphaned packs or create missing micro services'
      });
    }

    // 2. Check for duplicate slugs in micro services
    const { data: allMicros } = await supabase
      .from('service_micro_categories')
      .select('slug, is_active')
      .eq('is_active', true);

    const slugCounts = new Map<string, number>();
    allMicros?.forEach(m => {
      slugCounts.set(m.slug, (slugCounts.get(m.slug) || 0) + 1);
    });

    const duplicates = [...slugCounts.entries()].filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      issues.push({
        severity: 'critical',
        category: 'duplicate_slugs',
        message: `${duplicates.length} micro service slugs have duplicates`,
        affected_items: duplicates.map(([slug]) => slug),
        fix_suggestion: 'Deactivate duplicate entries, keeping only one per slug'
      });
    }

    // 3. Check for packs with empty questions
    const { data: packsWithQuestions } = await supabase
      .from('question_packs')
      .select('micro_slug, content')
      .eq('is_active', true)
      .eq('status', 'approved');

    const emptyPacks = packsWithQuestions?.filter(p => {
      const questions = p.content?.questions || [];
      return questions.length === 0;
    }) || [];

    if (emptyPacks.length > 0) {
      issues.push({
        severity: 'critical',
        category: 'empty_packs',
        message: `${emptyPacks.length} approved packs have no questions`,
        affected_items: emptyPacks.map(p => p.micro_slug),
        fix_suggestion: 'Add questions to these packs or mark them as draft'
      });
    }

    // 4. Check for packs missing aiHint/question text
    const packsWithMissingText = packsWithQuestions?.filter(p => {
      const questions = p.content?.questions || [];
      return questions.some((q: any) => !q.aiHint && !q.question);
    }) || [];

    if (packsWithMissingText.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'missing_question_text',
        message: `${packsWithMissingText.length} packs have questions without aiHint or question text`,
        affected_items: packsWithMissingText.map(p => p.micro_slug),
        fix_suggestion: 'Add aiHint field to all questions for proper display'
      });
    }

    // 5. Check for inactive categories with active services
    const { data: inactiveCategories } = await supabase
      .from('service_categories')
      .select('id, name')
      .eq('is_active', false);

    for (const cat of inactiveCategories || []) {
      const { count } = await supabase
        .from('service_subcategories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('is_active', true);

      if (count && count > 0) {
        issues.push({
          severity: 'warning',
          category: 'inactive_parent',
          message: `Inactive category "${cat.name}" has ${count} active subcategories`,
          affected_items: [cat.name],
          fix_suggestion: 'Either reactivate the category or deactivate child subcategories'
        });
      }
    }

    // 6. Check pack version consistency
    const { data: multiVersionPacks } = await supabase
      .from('question_packs')
      .select('micro_slug, version, status, is_active')
      .eq('is_active', true)
      .eq('status', 'approved');

    const slugVersions = new Map<string, number[]>();
    multiVersionPacks?.forEach(p => {
      const versions = slugVersions.get(p.micro_slug) || [];
      versions.push(p.version);
      slugVersions.set(p.micro_slug, versions);
    });

    const multipleApproved = [...slugVersions.entries()].filter(([_, versions]) => versions.length > 1);
    if (multipleApproved.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'multiple_approved',
        message: `${multipleApproved.length} slugs have multiple approved active packs`,
        affected_items: multipleApproved.map(([slug]) => slug),
        fix_suggestion: 'Keep only the latest approved version active'
      });
    }

    // Calculate health score (0-100)
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const healthScore = Math.max(0, 100 - (criticalCount * 20) - (warningCount * 5));

    // Generate recommendations
    if (healthScore < 80) {
      recommendations.push('Address critical issues immediately to prevent user-facing problems');
    }
    if (orphaned.length > 10) {
      recommendations.push('Consider batch cleanup of orphaned packs');
    }
    if (duplicates.length > 0) {
      recommendations.push('Run deduplication script to remove duplicate micro services');
    }
    if (healthScore === 100) {
      recommendations.push('System is healthy! Continue monitoring regularly.');
    }

    const result: AuditResult = {
      timestamp: new Date().toISOString(),
      summary: {
        total_packs: packsWithQuestions?.length || 0,
        active_packs: packsWithQuestions?.filter(p => p.content?.questions?.length > 0).length || 0,
        issues_found: issues.length,
        health_score: healthScore
      },
      issues,
      recommendations
    };

    // Log to admin alerts if critical issues found
    if (criticalCount > 0) {
      await supabase.from('admin_alerts').insert({
        alert_type: 'data_quality',
        severity: 'high',
        message: `Question packs audit found ${criticalCount} critical issues`,
        metadata: { audit_result: result }
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Audit error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
