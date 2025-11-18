// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('[Escalation Check] Starting dispute escalation check...');

    // Find disputes that need escalation check
    const { data: disputes, error: fetchError } = await supabaseClient
      .from('disputes')
      .select('id, status, last_activity_at, response_deadline, escalation_level')
      .in('status', ['open', 'in_progress'])
      .order('last_activity_at', { ascending: true });

    if (fetchError) {
      console.error('[Escalation Check] Error fetching disputes:', fetchError);
      throw fetchError;
    }

    console.log(`[Escalation Check] Found ${disputes?.length || 0} active disputes`);

    const now = new Date();
    const results = [];

    for (const dispute of disputes || []) {
      let needsEscalation = false;
      const reasons: string[] = [];

      // Check inactivity (48 hours)
      if (dispute.last_activity_at) {
        const lastActivity = new Date(dispute.last_activity_at);
        const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceActivity > 48) {
          needsEscalation = true;
          reasons.push(`Inactive for ${Math.round(hoursSinceActivity)} hours`);
        }
      }

      // Check deadline passed
      if (dispute.response_deadline) {
        const deadline = new Date(dispute.response_deadline);
        if (now > deadline) {
          needsEscalation = true;
          const hoursOverdue = (now.getTime() - deadline.getTime()) / (1000 * 60 * 60);
          reasons.push(`Deadline overdue by ${Math.round(hoursOverdue)} hours`);
        }
      }

      if (needsEscalation) {
        console.log(`[Escalation Check] Escalating dispute ${dispute.id}: ${reasons.join(', ')}`);

        // Call escalation function
        const { error: escalationError } = await supabaseClient.rpc(
          'escalation_reasons_updater',
          { p_dispute_id: dispute.id }
        );

        if (escalationError) {
          console.error(`[Escalation Check] Error escalating dispute ${dispute.id}:`, escalationError);
        } else {
          results.push({
            disputeId: dispute.id,
            reasons,
            escalated: true,
          });
        }
      }
    }

    console.log(`[Escalation Check] Completed. Escalated ${results.length} disputes`);

    return new Response(
      JSON.stringify({
        success: true,
        checked: disputes?.length || 0,
        escalated: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Escalation Check] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
