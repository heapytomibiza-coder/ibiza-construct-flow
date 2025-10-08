import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHECKS = {
  FORM_COMPLEXITY: 'form_complexity',
  DROPOFF_SPIKE: 'dropoff_spike',
  ERROR_THRESHOLD: 'error_threshold',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    const { action } = await req.json();

    if (action === 'run_checks') {
      console.log('[UX-Ray] Starting automated health checks...');
      await runAllChecks(supabaseClient);
      console.log('[UX-Ray] All checks completed successfully');
      
      return new Response(
        JSON.stringify({ success: true, message: 'Health checks completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('[UX-Ray] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function runAllChecks(client: any) {
  await checkDropoffSpikes(client);
  await checkFormComplexity(client);
  await checkErrorThresholds(client);
}

async function checkDropoffSpikes(client: any) {
  console.log('[UX-Ray] Checking dropoff spikes...');
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Get wizard step views vs completions
  const { data: events, error } = await client
    .from('analytics_events')
    .select('event_name, event_properties')
    .in('event_name', ['wizard_step_view', 'wizard_step_complete'])
    .gte('created_at', sevenDaysAgo);

  if (error) {
    console.error('[UX-Ray] Error fetching events:', error);
    return;
  }

  // Calculate drop-off rates per step
  const stepViews: Record<number, number> = {};
  const stepCompletions: Record<number, number> = {};
  
  events?.forEach((event: any) => {
    const step = event.event_properties?.step;
    if (!step) return;
    
    if (event.event_name === 'wizard_step_view') {
      stepViews[step] = (stepViews[step] || 0) + 1;
    } else {
      stepCompletions[step] = (stepCompletions[step] || 0) + 1;
    }
  });
  
  // Check thresholds and create warnings
  for (const [step, views] of Object.entries(stepViews)) {
    const completions = stepCompletions[Number(step)] || 0;
    const dropoffRate = ((views - completions) / views) * 100;
    
    if (dropoffRate > 50) {
      await insertHealthCheck(client, {
        check_type: CHECKS.DROPOFF_SPIKE,
        severity: 'critical',
        entity_type: 'wizard_step',
        entity_id: `step_${step}`,
        message: `Critical: ${dropoffRate.toFixed(1)}% drop-off on Step ${step}`,
        metadata: { dropoffRate, views, completions, threshold: 50 }
      });
      
      await createBusinessInsight(client, {
        insight_type: 'ux_friction',
        insight_title: `Wizard Step ${step} Losing Half Your Users`,
        insight_description: `${dropoffRate.toFixed(0)}% of users are abandoning at Step ${step}. This suggests confusion or excessive friction.`,
        priority: 'high',
        action_items: [
          'Review form field requirements',
          'Add inline help text or tooltips',
          'Consider breaking into smaller steps'
        ]
      });
      
      console.log(`[UX-Ray] CRITICAL dropoff detected: Step ${step} - ${dropoffRate.toFixed(1)}%`);
    } else if (dropoffRate > 30) {
      await insertHealthCheck(client, {
        check_type: CHECKS.DROPOFF_SPIKE,
        severity: 'high',
        entity_type: 'wizard_step',
        entity_id: `step_${step}`,
        message: `High drop-off on Step ${step}: ${dropoffRate.toFixed(1)}%`,
        metadata: { dropoffRate, views, completions, threshold: 30 }
      });
      
      console.log(`[UX-Ray] High dropoff detected: Step ${step} - ${dropoffRate.toFixed(1)}%`);
    }
  }
}

async function checkFormComplexity(client: any) {
  console.log('[UX-Ray] Checking form complexity...');
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: events, error } = await client
    .from('analytics_events')
    .select('event_properties, page_url')
    .eq('event_name', 'form_field_focus')
    .gte('created_at', sevenDaysAgo);

  if (error) {
    console.error('[UX-Ray] Error fetching form events:', error);
    return;
  }

  // Group by page and count unique fields
  const pageFields: Record<string, Set<string>> = {};
  
  events?.forEach((event: any) => {
    const page = event.page_url || 'unknown';
    const fieldName = event.event_properties?.fieldName;
    
    if (!fieldName) return;
    
    if (!pageFields[page]) {
      pageFields[page] = new Set();
    }
    pageFields[page].add(fieldName);
  });
  
  // Check thresholds
  for (const [page, fields] of Object.entries(pageFields)) {
    const fieldCount = fields.size;
    
    if (fieldCount > 8) {
      await insertHealthCheck(client, {
        check_type: CHECKS.FORM_COMPLEXITY,
        severity: 'high',
        entity_type: 'page',
        entity_id: page,
        message: `Form has ${fieldCount} fields - users may be overwhelmed`,
        metadata: { fieldCount, threshold: 8, fields: Array.from(fields) }
      });
      
      console.log(`[UX-Ray] High complexity form detected: ${page} - ${fieldCount} fields`);
    } else if (fieldCount > 5) {
      await insertHealthCheck(client, {
        check_type: CHECKS.FORM_COMPLEXITY,
        severity: 'medium',
        entity_type: 'page',
        entity_id: page,
        message: `Form has ${fieldCount} fields - consider splitting`,
        metadata: { fieldCount, threshold: 5, fields: Array.from(fields) }
      });
      
      console.log(`[UX-Ray] Medium complexity form detected: ${page} - ${fieldCount} fields`);
    }
  }
}

async function checkErrorThresholds(client: any) {
  console.log('[UX-Ray] Checking error thresholds...');
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: events, error } = await client
    .from('analytics_events')
    .select('event_properties')
    .eq('event_name', 'form_validation_error')
    .gte('created_at', oneDayAgo);

  if (error) {
    console.error('[UX-Ray] Error fetching validation errors:', error);
    return;
  }

  // Count errors per field
  const fieldErrors: Record<string, number> = {};
  
  events?.forEach((event: any) => {
    const fieldName = event.event_properties?.fieldName;
    if (!fieldName) return;
    
    fieldErrors[fieldName] = (fieldErrors[fieldName] || 0) + 1;
  });
  
  // Check thresholds
  for (const [field, errorCount] of Object.entries(fieldErrors)) {
    if (errorCount > 20) {
      await insertHealthCheck(client, {
        check_type: CHECKS.ERROR_THRESHOLD,
        severity: 'high',
        entity_type: 'form_field',
        entity_id: field,
        message: `Field "${field}" has ${errorCount} validation errors in 24h`,
        metadata: { errorCount, threshold: 20, period: '24h' }
      });
      
      await createBusinessInsight(client, {
        insight_type: 'ux_friction',
        insight_title: `Validation Error Spike on "${field}"`,
        insight_description: `${errorCount} validation errors in the last 24 hours. Users may be confused by requirements.`,
        priority: 'medium',
        action_items: [
          'Review validation rules',
          'Add clearer field instructions',
          'Show validation hints before submission'
        ]
      });
      
      console.log(`[UX-Ray] High error rate detected: ${field} - ${errorCount} errors/24h`);
    }
  }
}

async function insertHealthCheck(client: any, data: any) {
  // Check if warning already exists and is active
  const { data: existing } = await client
    .from('ux_health_checks')
    .select('id')
    .eq('check_type', data.check_type)
    .eq('entity_id', data.entity_id)
    .eq('status', 'active')
    .maybeSingle();
  
  if (!existing) {
    const { error } = await client
      .from('ux_health_checks')
      .insert(data);
    
    if (error) {
      console.error('[UX-Ray] Error inserting health check:', error);
    } else {
      console.log(`[UX-Ray] Created health check: ${data.check_type} - ${data.entity_id}`);
    }
  } else {
    console.log(`[UX-Ray] Skipped duplicate: ${data.check_type} - ${data.entity_id}`);
  }
}

async function createBusinessInsight(client: any, data: any) {
  // Get authenticated user (for scheduled jobs, this won't exist, so we skip)
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) {
    console.log('[UX-Ray] Skipping insight creation - no user context');
    return;
  }

  const { error } = await client
    .from('business_insights')
    .insert({
      user_id: user.id,
      insight_type: data.insight_type,
      insight_title: data.insight_title,
      insight_description: data.insight_description,
      priority: data.priority,
      impact_score: data.priority === 'high' ? 8.5 : 6.5,
      action_items: data.action_items
    });
  
  if (error) {
    console.error('[UX-Ray] Error creating business insight:', error);
  } else {
    console.log(`[UX-Ray] Created business insight: ${data.insight_title}`);
  }
}