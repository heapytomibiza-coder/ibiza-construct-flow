import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { serverClient } from "../_shared/client.ts";
import { getErrorMessage } from '../_shared/errorUtils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = serverClient(req);

    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    const { data: kpis, error: kpisError } = await supabase.rpc('get_dispute_kpis', {
      p_from: weekAgo.toISOString().slice(0, 10),
      p_to: today.toISOString().slice(0, 10),
    });

    if (kpisError) throw kpisError;

    // Calculate summary
    const totalResolved = (kpis || []).reduce((sum: number, day: any) => sum + (day.resolved_count || 0), 0);
    const avgResolutionHours = (kpis || []).length > 0
      ? (kpis || []).reduce((sum: number, day: any) => sum + (day.avg_resolution_hours || 0), 0) / (kpis || []).length
      : 0;
    const totalAdminForced = (kpis || []).reduce((sum: number, day: any) => sum + (day.admin_forced_count || 0), 0);
    const totalExpired = (kpis || []).reduce((sum: number, day: any) => sum + (day.expired_count || 0), 0);

    const summary = {
      period: `${weekAgo.toISOString().slice(0, 10)} to ${today.toISOString().slice(0, 10)}`,
      total_resolved: totalResolved,
      avg_resolution_hours: Math.round(avgResolutionHours * 10) / 10,
      admin_forced: totalAdminForced,
      expired: totalExpired,
      generated_at: new Date().toISOString(),
    };

    console.log('Weekly Insights Digest:', summary);

    // TODO: Send email to admin team
    // For now, just log the summary

    return new Response(
      JSON.stringify({ success: true, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Weekly insights digest error:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
