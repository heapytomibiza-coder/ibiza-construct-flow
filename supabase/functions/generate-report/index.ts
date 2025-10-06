import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { report_id } = await req.json();

    if (!report_id) {
      throw new Error('Report ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[Report] Generating report ${report_id}`);

    // Fetch report configuration
    const { data: report, error: reportError } = await supabase
      .from('analytics_reports')
      .select('*')
      .eq('id', report_id)
      .single();

    if (reportError) throw reportError;

    const config = report.config as any;
    const reportData: any = {
      name: report.name,
      description: report.description,
      generated_at: new Date().toISOString(),
      sections: []
    };

    // Fetch data based on report type
    if (report.report_type === 'revenue') {
      console.log('[Report] Fetching revenue data');
      
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('*')
        .gte('created_at', config.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', config.dateRange?.end || new Date().toISOString())
        .in('status', ['completed', 'succeeded']);

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const avgTransaction = payments && payments.length > 0 ? totalRevenue / payments.length : 0;

      reportData.sections.push({
        title: 'Revenue Summary',
        data: {
          total_revenue: totalRevenue,
          transaction_count: payments?.length || 0,
          average_transaction: avgTransaction,
          currency: 'USD'
        }
      });

    } else if (report.report_type === 'performance') {
      console.log('[Report] Fetching performance data');

      const { data: metrics } = await supabase
        .from('professional_performance_metrics')
        .select('*')
        .gte('period_start', config.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('period_end', config.dateRange?.end || new Date().toISOString());

      const avgCompletionRate = metrics && metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.completion_rate || 0), 0) / metrics.length
        : 0;

      const avgRating = metrics && metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.average_rating || 0), 0) / metrics.length
        : 0;

      reportData.sections.push({
        title: 'Performance Summary',
        data: {
          professionals_analyzed: metrics?.length || 0,
          average_completion_rate: avgCompletionRate,
          average_rating: avgRating,
          metrics_count: metrics?.length || 0
        }
      });

    } else if (report.report_type === 'engagement') {
      console.log('[Report] Fetching engagement data');

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .gte('created_at', config.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', config.dateRange?.end || new Date().toISOString());

      reportData.sections.push({
        title: 'Engagement Summary',
        data: {
          total_messages: messages?.length || 0,
          active_conversations: new Set(messages?.map((m) => m.conversation_id)).size
        }
      });
    }

    // Update report last_generated_at
    await supabase
      .from('analytics_reports')
      .update({ last_generated_at: new Date().toISOString() })
      .eq('id', report_id);

    console.log('[Report] Report generated successfully');

    return new Response(
      JSON.stringify({ success: true, report: reportData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Report] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});