/**
 * Respond to Resolution Edge Function
 * Parties accept, reject, or counter-propose resolutions
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
      resolutionId,
      response, // 'accepted', 'rejected', 'counter_proposed'
      counterProposal,
    } = await req.json();

    console.log('Responding to resolution:', { resolutionId, response, userId: user.id });

    // Get resolution and dispute details
    const { data: resolution, error: resolutionError } = await supabase
      .from('dispute_resolutions')
      .select('*, disputes(*)')
      .eq('id', resolutionId)
      .single();

    if (resolutionError || !resolution) {
      return new Response(JSON.stringify({ error: 'Resolution not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dispute = resolution.disputes;

    // Determine user role
    const isClient = user.id === dispute.created_by;
    const isProfessional = user.id === dispute.disputed_against;

    if (!isClient && !isProfessional) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userRole = isClient ? 'client' : 'professional';
    const statusField = isClient ? 'client_status' : 'professional_status';
    const responseAtField = isClient ? 'client_response_at' : 'professional_response_at';

    // Update resolution with response
    const updateData: any = {
      [statusField]: response,
      [responseAtField]: new Date().toISOString(),
    };

    // Check if both parties have now agreed
    const otherStatusField = isClient ? 'professional_status' : 'client_status';
    const otherStatus = resolution[otherStatusField];

    if (response === 'accepted' && otherStatus === 'accepted') {
      // Both agreed! Mark as agreed and set for auto-execution
      updateData.status = 'agreed';
      updateData.agreement_finalized_at = new Date().toISOString();
      if (!resolution.auto_execute_date) {
        updateData.auto_execute_date = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const { data: updatedResolution, error: updateError } = await supabase
      .from('dispute_resolutions')
      .update(updateData)
      .eq('id', resolutionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating resolution:', updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If counter-proposal, create counter-proposal record
    if (response === 'counter_proposed' && counterProposal) {
      await supabase.from('dispute_counter_proposals').insert({
        dispute_id: dispute.id,
        original_resolution_id: resolutionId,
        proposed_by: userRole,
        proposed_by_user_id: user.id,
        counter_proposal_text: counterProposal.text,
        proposed_amount: counterProposal.amount,
        proposed_timeline_days: counterProposal.timelineDays,
        status: 'pending',
      });
    }

    // Update dispute activity
    await supabase
      .from('disputes')
      .update({ 
        last_activity_at: new Date().toISOString(),
        workflow_state: response === 'accepted' && otherStatus === 'accepted' ? 'awaiting_response' : 'mediation',
      })
      .eq('id', dispute.id);

    // Create timeline event
    const eventDescription = response === 'accepted' 
      ? `${userRole} accepted the resolution` 
      : response === 'rejected'
      ? `${userRole} rejected the resolution`
      : `${userRole} submitted a counter-proposal`;

    await supabase.from('dispute_timeline').insert({
      dispute_id: dispute.id,
      event_type: 'resolution_response',
      description: eventDescription,
      metadata: {
        resolution_id: resolutionId,
        response,
        user_role: userRole,
      },
    });

    // Notify other party
    const otherParty = isClient ? dispute.disputed_against : dispute.created_by;
    const bothAgreed = response === 'accepted' && otherStatus === 'accepted';
    
    let notificationTitle = '';
    let notificationDesc = '';
    
    if (bothAgreed) {
      notificationTitle = 'Resolution Agreed!';
      notificationDesc = 'Both parties have accepted the resolution. It will be executed automatically in 24 hours unless appealed.';
    } else if (response === 'accepted') {
      notificationTitle = 'Resolution Accepted';
      notificationDesc = `The ${userRole} has accepted the resolution proposal. Awaiting your response.`;
    } else if (response === 'rejected') {
      notificationTitle = 'Resolution Rejected';
      notificationDesc = `The ${userRole} has rejected the resolution proposal.`;
    } else {
      notificationTitle = 'Counter-Proposal Received';
      notificationDesc = `The ${userRole} has submitted a counter-proposal.`;
    }

    await supabase.from('activity_feed').insert({
      user_id: otherParty,
      event_type: 'resolution_response',
      entity_type: 'dispute',
      entity_id: dispute.id,
      title: notificationTitle,
      description: notificationDesc,
      action_url: `/disputes/${dispute.id}`,
      notification_type: 'dispute',
      priority: bothAgreed ? 'high' : 'medium',
    });

    // If both agreed, trigger execution workflow
    if (bothAgreed) {
      console.log('Both parties agreed - resolution will auto-execute in 24h');
      
      // Log enforcement
      await supabase.from('enforcement_logs').insert({
        dispute_id: dispute.id,
        action_type: 'resolution_agreed',
        performed_by: 'system',
        action_details: 'Both parties agreed to resolution. Auto-execution scheduled in 24 hours.',
        deadline_set: updatedResolution.auto_execute_date,
      });
    }

    console.log('Resolution response recorded:', response);

    return new Response(
      JSON.stringify({ 
        success: true, 
        resolution: updatedResolution,
        bothAgreed,
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in respond-to-resolution:', error);
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