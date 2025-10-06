import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { serverClient } from "../_shared/client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEIGHTS = {
  response_timeliness: 0.25,
  dispute_frequency: 0.25,
  cooperation: 0.20,
  review_reliability: 0.15,
  sentiment_health: 0.15,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = serverClient(req);

    // Refresh views first
    await supabase.rpc('refresh_analytics_views');

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(10000);

    if (usersError) throw usersError;

    let processed = 0;
    for (const user of users || []) {
      // Fetch user stats from materialized view
      const { data: stats } = await supabase
        .from('mv_user_dispute_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Calculate component scores (simplified)
      const totalDisputes = stats?.total_disputes || 0;
      const adminForced = stats?.admin_forced_disputes || 0;
      const expired = stats?.expired_disputes || 0;

      // Response timeliness: default 80, reduce if many disputes
      const rt = clamp(80 - (totalDisputes * 2), 40, 100);

      // Dispute frequency: penalize if many disputes
      const df = clamp(100 - (totalDisputes * 5), 40, 100);

      // Cooperation: penalize admin-forced and expired
      const badOutcomes = adminForced + expired;
      const co = totalDisputes > 0 
        ? clamp(100 - (badOutcomes / totalDisputes * 100), 40, 100)
        : 80;

      // Review reliability & sentiment: default for now
      const rr = 80;
      const sh = 80;

      const final =
        WEIGHTS.response_timeliness * rt +
        WEIGHTS.dispute_frequency * df +
        WEIGHTS.cooperation * co +
        WEIGHTS.review_reliability * rr +
        WEIGHTS.sentiment_health * sh;

      const score = clamp(final, 20, 99);

      // Upsert quality score
      await supabase
        .from('quality_scores')
        .upsert({
          user_id: user.id,
          score: Math.round(score * 100) / 100,
          last_recalculated_at: new Date().toISOString(),
          breakdown: {
            response_timeliness: Math.round(rt * 100) / 100,
            dispute_frequency: Math.round(df * 100) / 100,
            cooperation: Math.round(co * 100) / 100,
            review_reliability: Math.round(rr * 100) / 100,
            sentiment_health: Math.round(sh * 100) / 100,
            weights: WEIGHTS,
          },
        });

      processed++;
    }

    return new Response(
      JSON.stringify({ success: true, processed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Quality recalculation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
