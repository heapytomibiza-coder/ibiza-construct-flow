/**
 * Get Dispute Analytics Edge Function
 * Returns KPIs and early warnings for admin dashboard
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin permission
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching dispute analytics');

    // Get KPIs
    const { data: allDisputes } = await supabase
      .from('disputes')
      .select('*');

    const { data: resolvedDisputes } = await supabase
      .from('disputes')
      .select('created_at, resolved_at')
      .eq('workflow_state', 'resolved')
      .not('resolved_at', 'is', null);

    // Calculate KPIs
    const totalDisputes = allDisputes?.length || 0;
    const resolved = resolvedDisputes?.length || 0;
    
    // Calculate average resolution time in hours
    let avgResolutionHrs = 0;
    if (resolvedDisputes && resolvedDisputes.length > 0) {
      const totalHours = resolvedDisputes.reduce((sum, d) => {
        const created = new Date(d.created_at).getTime();
        const resolved = new Date(d.resolved_at!).getTime();
        return sum + (resolved - created) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHrs = Math.round(totalHours / resolvedDisputes.length);
    }

    // Admin forced resolutions (resolutions with no agreement)
    const { data: forcedResolutions } = await supabase
      .from('dispute_resolutions')
      .select('id')
      .eq('status', 'executed')
      .or('client_status.neq.accepted,professional_status.neq.accepted');

    const adminForced = forcedResolutions?.length || 0;

    // Get early warnings
    const { data: warnings } = await supabase
      .from('early_warnings')
      .select('*')
      .eq('status', 'active')
      .order('detected_at', { ascending: false });

    const kpis = {
      resolved,
      avgResolutionHrs,
      adminForced,
      expired: 0, // TODO: Calculate from resolution deadlines
    };

    console.log('Analytics retrieved:', { totalDisputes, kpis, warnings: warnings?.length });

    return new Response(
      JSON.stringify({ 
        success: true,
        kpis,
        warnings: warnings || [],
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-dispute-analytics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});