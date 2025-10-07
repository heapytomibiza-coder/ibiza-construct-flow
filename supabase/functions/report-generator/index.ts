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

    const { reportType, dateRange, filters } = await req.json();

    let reportData = {};

    switch (reportType) {
      case 'revenue':
        reportData = await generateRevenueReport(supabaseClient, user.id, dateRange, filters);
        break;

      case 'performance':
        reportData = await generatePerformanceReport(supabaseClient, user.id, dateRange);
        break;

      case 'activity':
        reportData = await generateActivityReport(supabaseClient, user.id, dateRange);
        break;

      default:
        throw new Error('Invalid report type');
    }

    return new Response(
      JSON.stringify({ data: reportData, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

async function generateRevenueReport(supabaseClient: any, userId: string, dateRange: any, filters: any) {
  const { data: transactions } = await supabaseClient
    .from('revenue_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('processed_at', dateRange.start)
    .lte('processed_at', dateRange.end);

  const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const completedTransactions = transactions?.filter(t => t.status === 'completed').length || 0;

  const byCategory = transactions?.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  return {
    totalRevenue,
    totalTransactions: transactions?.length || 0,
    completedTransactions,
    averageTransaction: completedTransactions > 0 ? totalRevenue / completedTransactions : 0,
    byCategory,
    transactions,
  };
}

async function generatePerformanceReport(supabaseClient: any, userId: string, dateRange: any) {
  const { data: metrics } = await supabaseClient
    .from('performance_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('period_start', dateRange.start)
    .lte('period_end', dateRange.end);

  const avgByType = metrics?.reduce((acc, m) => {
    if (!acc[m.metric_type]) {
      acc[m.metric_type] = { sum: 0, count: 0 };
    }
    acc[m.metric_type].sum += Number(m.metric_value);
    acc[m.metric_type].count += 1;
    return acc;
  }, {});

  const averages = Object.entries(avgByType || {}).reduce((acc, [type, data]: [string, any]) => {
    acc[type] = data.sum / data.count;
    return acc;
  }, {});

  return {
    totalMetrics: metrics?.length || 0,
    averages,
    metrics,
  };
}

async function generateActivityReport(supabaseClient: any, userId: string, dateRange: any) {
  const { data: events } = await supabaseClient
    .from('analytics_events')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  const eventsByType = events?.reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] || 0) + 1;
    return acc;
  }, {});

  const eventsByCategory = events?.reduce((acc, e) => {
    acc[e.event_category] = (acc[e.event_category] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEvents: events?.length || 0,
    eventsByType,
    eventsByCategory,
    events: events?.slice(0, 100), // Limit to most recent 100
  };
}
