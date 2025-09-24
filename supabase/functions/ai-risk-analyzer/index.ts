import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, jobDetails, professionalProfile } = await req.json();

    if (!jobId || !jobDetails) {
      throw new Error('Job ID and details are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Analyzing risks for job:', jobId);

    // Analyze various risk factors
    const riskFlags = [];

    // Check for complexity vs experience mismatch
    if (jobDetails.complexity === 'high' && professionalProfile?.experience_level === 'beginner') {
      riskFlags.push({
        job_id: jobId,
        flag_type: 'complexity_mismatch',
        severity: 'high',
        message: 'High complexity job assigned to beginner professional',
        suggested_action: 'Consider providing additional support or reassigning to experienced professional'
      });
    }

    // Check for missing safety requirements
    if (jobDetails.category === 'electrical' && !jobDetails.safety_equipment?.includes('insulation_tester')) {
      riskFlags.push({
        job_id: jobId,
        flag_type: 'safety_requirement',
        severity: 'critical',
        message: 'Electrical work missing insulation testing equipment',
        suggested_action: 'Add insulation tester and safety equipment to job requirements'
      });
    }

    // Check for timeline risks
    const timelineRisk = analyzeTimelineRisk(jobDetails);
    if (timelineRisk) {
      riskFlags.push(timelineRisk);
    }

    // Check for pricing anomalies
    const pricingRisk = analyzePricingRisk(jobDetails);
    if (pricingRisk) {
      riskFlags.push(pricingRisk);
    }

    // Check for location risks
    if (jobDetails.location?.risk_factors?.length > 0) {
      riskFlags.push({
        job_id: jobId,
        flag_type: 'location_risk',
        severity: 'medium',
        message: `Location has known risk factors: ${jobDetails.location.risk_factors.join(', ')}`,
        suggested_action: 'Review location safety measures and inform professional'
      });
    }

    // Store risk flags in database
    if (riskFlags.length > 0) {
      const { error } = await supabase
        .from('ai_risk_flags')
        .insert(riskFlags);

      if (error) {
        console.error('Error storing risk flags:', error);
        throw error;
      }
    }

    // Log the analysis
    const { error: logError } = await supabase
      .from('ai_runs')
      .insert({
        function_name: 'ai-risk-analyzer',
        input_data: { jobId, jobDetails },
        output_data: { riskFlags },
        success: true,
        execution_time_ms: Date.now()
      });

    if (logError) {
      console.error('Error logging AI run:', logError);
    }

    return new Response(
      JSON.stringify({ 
        riskFlags,
        totalRisks: riskFlags.length,
        highestSeverity: getHighestSeverity(riskFlags)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in AI risk analyzer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function analyzeTimelineRisk(jobDetails: any) {
  const estimatedHours = jobDetails.estimated_hours || 0;
  const availableTime = jobDetails.time_window_hours || 0;

  if (estimatedHours > availableTime * 0.9) {
    return {
      job_id: jobDetails.id,
      flag_type: 'timeline_risk',
      severity: 'high',
      message: 'Estimated work time exceeds available time window',
      suggested_action: 'Extend time window or reduce scope'
    };
  }

  return null;
}

function analyzePricingRisk(jobDetails: any) {
  const price = jobDetails.total_price || 0;
  const marketAverage = jobDetails.market_average_price || 0;

  if (price < marketAverage * 0.7) {
    return {
      job_id: jobDetails.id,
      flag_type: 'pricing_risk',
      severity: 'medium',
      message: 'Job priced significantly below market average',
      suggested_action: 'Review pricing to ensure profitability'
    };
  }

  if (price > marketAverage * 1.5) {
    return {
      job_id: jobDetails.id,
      flag_type: 'pricing_risk',
      severity: 'medium',
      message: 'Job priced significantly above market average',
      suggested_action: 'Verify pricing justification with client'
    };
  }

  return null;
}

function getHighestSeverity(riskFlags: any[]) {
  const severityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
  let highest = 'low';

  riskFlags.forEach(flag => {
    if (severityOrder[flag.severity] > severityOrder[highest]) {
      highest = flag.severity;
    }
  });

  return highest;
}