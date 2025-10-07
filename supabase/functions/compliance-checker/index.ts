import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, framework_code } = await req.json();

    switch (action) {
      case 'check_compliance':
        const compliance = await checkUserCompliance(supabaseClient, user.id, framework_code);
        return new Response(
          JSON.stringify({ compliance, success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_frameworks':
        const { data: frameworks } = await supabaseClient
          .from('compliance_frameworks')
          .select('*')
          .eq('is_active', true);

        return new Response(
          JSON.stringify({ frameworks, success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_user_compliance_status':
        const { data: statuses } = await supabaseClient
          .from('user_compliance_status')
          .select('*, compliance_frameworks(*)')
          .eq('user_id', user.id);

        return new Response(
          JSON.stringify({ statuses, success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'generate_report':
        const report = await generateComplianceReport(supabaseClient, user.id, framework_code);
        return new Response(
          JSON.stringify({ report, success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

async function checkUserCompliance(supabaseClient: any, userId: string, frameworkCode: string) {
  // Get framework
  const { data: framework } = await supabaseClient
    .from('compliance_frameworks')
    .select('*')
    .eq('framework_code', frameworkCode)
    .single();

  if (!framework) {
    throw new Error('Framework not found');
  }

  // Get user privacy controls
  const { data: privacyControls } = await supabaseClient
    .from('data_privacy_controls')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Check each requirement
  const requirements = framework.requirements as any[];
  const requirementsMet = [];
  const requirementsPending = [];

  for (const req of requirements) {
    const isMet = checkRequirement(req.id, privacyControls, frameworkCode);
    if (isMet) {
      requirementsMet.push(req.id);
    } else {
      requirementsPending.push(req.id);
    }
  }

  const complianceScore = (requirementsMet.length / requirements.length) * 100;
  const status = complianceScore === 100 ? 'compliant' : complianceScore >= 80 ? 'mostly_compliant' : 'non_compliant';

  // Update or insert compliance status
  await supabaseClient
    .from('user_compliance_status')
    .upsert({
      user_id: userId,
      framework_id: framework.id,
      compliance_score: complianceScore,
      requirements_met: requirementsMet,
      requirements_pending: requirementsPending,
      status,
      last_checked_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,framework_id',
    });

  return {
    framework: framework.framework_name,
    score: complianceScore,
    status,
    requirements_met: requirementsMet,
    requirements_pending: requirementsPending,
  };
}

function checkRequirement(requirementId: string, privacyControls: any, framework: string): boolean {
  if (!privacyControls) return false;

  // Basic checks for common requirements
  switch (requirementId) {
    case 'right_to_access':
    case 'right_to_know':
      return true; // API exists for data access
    
    case 'right_to_erasure':
    case 'right_to_delete':
      return true; // Deletion functionality exists
    
    case 'data_portability':
      return true; // Export functionality exists
    
    case 'consent_management':
      return privacyControls.consent_given_at != null;
    
    case 'encryption_enabled':
      return privacyControls.encryption_enabled === true;
    
    case 'two_factor_enabled':
      return privacyControls.two_factor_enabled === true;
    
    default:
      return false;
  }
}

async function generateComplianceReport(supabaseClient: any, userId: string, frameworkCode: string) {
  const compliance = await checkUserCompliance(supabaseClient, userId, frameworkCode);

  const report = {
    generated_at: new Date().toISOString(),
    framework: compliance.framework,
    overall_score: compliance.score,
    status: compliance.status,
    summary: `Compliance score: ${compliance.score}%. ${compliance.requirements_met.length} requirements met, ${compliance.requirements_pending.length} pending.`,
    findings: compliance.requirements_pending.map(req => ({
      requirement: req,
      status: 'not_met',
      recommendation: `Please ensure ${req} requirement is implemented`,
    })),
  };

  return report;
}
