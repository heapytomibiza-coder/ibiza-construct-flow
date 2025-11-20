import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { serverClient } from "../_shared/client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const THRESHOLDS = {
  slowResponseClientMins: 720,  // 12 hours
  slowResponseProMins: 360,     // 6 hours
  negativeSentimentAvg: -0.35,
  repeatOffenderScore: 60,
  adminForcedRatio: 0.3,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = serverClient(req);

    // Find open/in-progress disputes
    const { data: disputes, error: disputesError } = await supabase
      .from('disputes')
      .select('id, created_by, disputed_against, last_activity_at, status')
      .in('status', ['open', 'in_progress'])
      .limit(1000);

    if (disputesError) throw disputesError;

    let warningsCreated = 0;

    for (const dispute of disputes || []) {
      // Check slow response
      const lastActivity = dispute.last_activity_at 
        ? new Date(dispute.last_activity_at)
        : new Date(dispute.created_by);
      
      const minutesSinceActivity = (Date.now() - lastActivity.getTime()) / 1000 / 60;

      if (minutesSinceActivity > THRESHOLDS.slowResponseClientMins) {
        // Check if warning already exists
        const { data: existing } = await supabase
          .from('early_warnings')
          .select('id')
          .eq('dispute_id', dispute.id)
          .eq('kind', 'slow_response')
          .eq('is_resolved', false)
          .single();

        if (!existing) {
          await supabase.from('early_warnings').insert({
            dispute_id: dispute.id,
            level: minutesSinceActivity > 1440 ? 'urgent' : 'warning',
            kind: 'slow_response',
            details: {
              minutes_elapsed: Math.round(minutesSinceActivity),
              threshold: THRESHOLDS.slowResponseClientMins,
            },
          });
          warningsCreated++;
        }
      }

      // Check for repeat offenders
      if (dispute.created_by) {
        const { data: quality } = await supabase
          .from('quality_scores')
          .select('score')
          .eq('user_id', dispute.created_by)
          .single();

        if (quality && quality.score < THRESHOLDS.repeatOffenderScore) {
          const { data: existing } = await supabase
            .from('early_warnings')
            .select('id')
            .eq('dispute_id', dispute.id)
            .eq('kind', 'repeat_offender')
            .eq('is_resolved', false)
            .single();

          if (!existing) {
            await supabase.from('early_warnings').insert({
              dispute_id: dispute.id,
              offender_id: dispute.created_by,
              level: 'urgent',
              kind: 'repeat_offender',
              details: {
                quality_score: quality.score,
                threshold: THRESHOLDS.repeatOffenderScore,
              },
            });
            warningsCreated++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, warnings_created: warningsCreated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Early warning monitor error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
