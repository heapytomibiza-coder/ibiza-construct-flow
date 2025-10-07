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

    const { action, data } = await req.json();

    switch (action) {
      case 'track_event':
        await supabaseClient.from('analytics_events').insert({
          user_id: user.id,
          event_type: data.event_type,
          event_category: data.event_category,
          event_data: data.event_data || {},
          session_id: data.session_id,
        });
        break;

      case 'get_dashboard_stats':
        const { data: summary } = await supabaseClient
          .from('user_activity_summary')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentRevenue } = await supabaseClient
          .from('revenue_analytics')
          .select('amount')
          .eq('user_id', user.id)
          .gte('processed_at', thirtyDaysAgo.toISOString())
          .eq('status', 'completed');

        const monthlyRevenue = recentRevenue?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;

        return new Response(
          JSON.stringify({
            summary,
            monthlyRevenue,
            success: true,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'generate_insights':
        // Generate business insights based on user data
        const insights = await generateBusinessInsights(supabaseClient, user.id);
        return new Response(
          JSON.stringify({ insights, success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

async function generateBusinessInsights(supabaseClient: any, userId: string) {
  const insights = [];

  // Get user metrics
  const { data: metrics } = await supabaseClient
    .from('performance_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Analyze response time
  const avgResponseTime = metrics?.find(m => m.metric_type === 'response_time')?.metric_value;
  if (avgResponseTime && avgResponseTime > 3600) {
    insights.push({
      user_id: userId,
      insight_type: 'performance',
      insight_title: 'Improve Response Time',
      insight_description: 'Your average response time is over 1 hour. Faster responses can increase your booking rate by 30%.',
      priority: 'high',
      impact_score: 8.5,
      action_items: ['Enable push notifications', 'Set up auto-responses', 'Check messages daily'],
    });
  }

  // Save insights to database
  if (insights.length > 0) {
    await supabaseClient.from('business_insights').insert(insights);
  }

  return insights;
}
