/**
 * Propose Resolution Edge Function
 * Platform, admin, or party can propose dispute resolutions
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

    const {
      disputeId,
      resolutionType,
      title,
      description,
      proposedAmount,
      workRequired,
      timelineDays,
    } = await req.json();

    console.log('Proposing resolution:', { disputeId, resolutionType, userId: user.id });

    // Get dispute details
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', disputeId)
      .single();

    if (disputeError || !dispute) {
      return new Response(JSON.stringify({ error: 'Dispute not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine proposer type
    let proposedBy = 'platform';
    if (user.id === dispute.created_by) {
      proposedBy = 'client';
    } else if (user.id === dispute.disputed_against) {
      proposedBy = 'professional';
    }

    // Check if user has permission (admin, or party to dispute)
    const isParty = user.id === dispute.created_by || user.id === dispute.disputed_against;
    
    // For now, allow only parties and admins
    if (!isParty) {
      // Check if admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      const isAdmin = roles?.some(r => r.role === 'admin');
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Not authorized to propose resolutions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      proposedBy = 'platform'; // Admins propose as platform
    }

    // Auto-execute date (24 hours after both parties agree)
    const autoExecuteDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create resolution proposal
    const { data: resolution, error: resolutionError } = await supabase
      .from('dispute_resolutions')
      .insert({
        dispute_id: disputeId,
        proposed_by: proposedBy,
        proposed_by_user_id: user.id,
        resolution_type: resolutionType,
        title,
        description,
        amount: proposedAmount,
        work_required: workRequired,
        timeline_days: timelineDays,
        status: 'proposed',
        auto_execute_date: autoExecuteDate.toISOString(),
        client_status: 'pending',
        professional_status: 'pending',
      })
      .select()
      .single();

    if (resolutionError) {
      console.error('Error creating resolution:', resolutionError);
      return new Response(JSON.stringify({ error: resolutionError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update dispute status to mediation
    await supabase
      .from('disputes')
      .update({ 
        workflow_state: 'mediation',
        mediation_started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', disputeId);

    // Create timeline event
    await supabase.from('dispute_timeline').insert({
      dispute_id: disputeId,
      event_type: 'resolution_proposed',
      description: `Resolution proposed: ${title}`,
      metadata: {
        proposed_by: proposedBy,
        resolution_type: resolutionType,
        amount: proposedAmount,
      },
    });

    // Log enforcement action
    await supabase.from('enforcement_logs').insert({
      dispute_id: disputeId,
      action_type: 'resolution_proposed',
      performed_by: proposedBy,
      performed_by_user_id: user.id,
      action_details: `Resolution proposed: ${resolutionType} - ${title}`,
      amount_affected: proposedAmount,
    });

    // Notify both parties
    const parties = [dispute.created_by, dispute.disputed_against];
    for (const partyId of parties) {
      if (partyId !== user.id) { // Don't notify proposer
        await supabase.from('activity_feed').insert({
          user_id: partyId,
          event_type: 'resolution_proposed',
          entity_type: 'dispute',
          entity_id: disputeId,
          title: 'Resolution Proposal Received',
          description: `A resolution has been proposed for the dispute: "${title}". Please review and respond.`,
          action_url: `/disputes/${disputeId}`,
          notification_type: 'dispute',
          priority: 'high',
        });
      }
    }

    console.log('Resolution proposed successfully:', resolution.id);

    return new Response(
      JSON.stringify({ success: true, resolution }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in propose-resolution:', error);
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