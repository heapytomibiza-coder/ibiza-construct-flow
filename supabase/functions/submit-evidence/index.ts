/**
 * Submit Evidence Edge Function
 * Bilateral evidence upload with verification tracking
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
      evidenceType,
      fileUrl,
      fileName,
      fileSize,
      description,
      timestampClaimed
    } = await req.json();

    console.log('Submitting evidence:', { disputeId, evidenceType, userId: user.id });

    // Verify user is party to dispute
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

    if (user.id !== dispute.created_by && user.id !== dispute.disputed_against) {
      return new Response(JSON.stringify({ error: 'Not authorized to submit evidence' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine user role
    const userRole = user.id === dispute.created_by ? 'client' : 'professional';

    // Check evidence deadline
    if (dispute.evidence_deadline && new Date(dispute.evidence_deadline) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Evidence submission deadline has passed' }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Submit evidence
    const { data: evidence, error: evidenceError } = await supabase
      .from('dispute_evidence')
      .insert({
        dispute_id: disputeId,
        uploaded_by: user.id,
        uploaded_by_role: userRole,
        evidence_type: evidenceType,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        description,
        timestamp_claimed: timestampClaimed,
      })
      .select()
      .single();

    if (evidenceError) {
      console.error('Error submitting evidence:', evidenceError);
      return new Response(JSON.stringify({ error: evidenceError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update dispute activity
    await supabase
      .from('disputes')
      .update({ 
        last_activity_at: new Date().toISOString(),
        workflow_state: 'evidence_gathering',
      })
      .eq('id', disputeId);

    // Create timeline event
    await supabase.from('dispute_timeline').insert({
      dispute_id: disputeId,
      event_type: 'evidence_submitted',
      description: `${userRole === 'client' ? 'Client' : 'Professional'} submitted ${evidenceType}`,
      metadata: {
        evidence_type: evidenceType,
        file_name: fileName,
      },
    });

    // Log enforcement action
    await supabase.from('enforcement_logs').insert({
      dispute_id: disputeId,
      action_type: 'evidence_requested',
      performed_by: userRole,
      performed_by_user_id: user.id,
      action_details: `Evidence submitted: ${evidenceType}`,
    });

    // Notify other party
    const otherParty = user.id === dispute.created_by ? dispute.disputed_against : dispute.created_by;
    await supabase.from('activity_feed').insert({
      user_id: otherParty,
      event_type: 'evidence_submitted',
      entity_type: 'dispute',
      entity_id: disputeId,
      title: 'New Evidence Submitted',
      description: `The other party has submitted evidence (${evidenceType}) in the dispute.`,
      action_url: `/disputes/${disputeId}`,
      notification_type: 'dispute',
      priority: 'medium',
    });

    console.log('Evidence submitted successfully:', evidence.id);

    return new Response(
      JSON.stringify({ success: true, evidence }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in submit-evidence:', error);
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