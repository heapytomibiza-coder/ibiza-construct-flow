/**
 * Create Dispute Edge Function
 * Trust-First: Includes 24-hour cooling-off period and initial safety checks
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

    // Get user from auth header
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
      jobId,
      contractId,
      category,
      title,
      description,
      severity = 'medium'
    } = await req.json();

    console.log('Creating dispute:', { jobId, contractId, userId: user.id, category });

    // Get contract details to identify parties
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*, jobs(client_id)')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return new Response(JSON.stringify({ error: 'Contract not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine who is filing and who it's against
    const clientId = contract.jobs.client_id;
    const professionalId = contract.tasker_id;
    const createdBy = user.id;
    const disputedAgainst = user.id === clientId ? professionalId : clientId;

    // Check for recent disputes (prevent spam)
    const { data: recentDisputes } = await supabase
      .from('disputes')
      .select('id')
      .eq('contract_id', contractId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .in('workflow_state', ['open', 'evidence_gathering', 'mediation']);

    if (recentDisputes && recentDisputes.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'A dispute for this contract is already active',
          existingDisputeId: recentDisputes[0].id
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate dispute number
    const disputeNumber = `DSP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate deadlines
    const now = new Date();
    const coolingOffEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const evidenceDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const responseDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    // Create dispute with trust-first features
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .insert({
        dispute_number: disputeNumber,
        job_id: jobId,
        contract_id: contractId,
        created_by: createdBy,
        disputed_against: disputedAgainst,
        type: category,
        dispute_category: category,
        status: 'open',
        workflow_state: 'open',
        priority: severity,
        title,
        description,
        cooling_off_period_end: coolingOffEnd.toISOString(),
        evidence_deadline: evidenceDeadline.toISOString(),
        response_deadline: responseDeadline.toISOString(),
        stage: 1,
        technical_validation_required: ['quality', 'incomplete_work', 'material_issue'].includes(category),
        escrow_frozen: true, // Automatically freeze escrow on dispute
      })
      .select()
      .single();

    if (disputeError) {
      console.error('Error creating dispute:', disputeError);
      return new Response(JSON.stringify({ error: disputeError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log enforcement action
    await supabase.from('enforcement_logs').insert({
      dispute_id: dispute.id,
      action_type: 'escrow_frozen',
      performed_by: 'system',
      action_details: `Escrow automatically frozen upon dispute creation. 24-hour cooling-off period initiated.`,
    });

    // Create timeline event
    await supabase.from('dispute_timeline').insert({
      dispute_id: dispute.id,
      event_type: 'dispute_created',
      description: 'Dispute filed - 24-hour cooling-off period active',
      metadata: {
        category,
        severity,
        cooling_off_end: coolingOffEnd.toISOString(),
      },
    });

    // Notify other party
    await supabase.from('activity_feed').insert({
      user_id: disputedAgainst,
      event_type: 'dispute_filed',
      entity_type: 'dispute',
      entity_id: dispute.id,
      title: 'A Dispute Has Been Filed',
      description: `A dispute has been filed regarding "${title}". You will have 3 days to respond with evidence. Payment is secured in escrow.`,
      action_url: `/disputes/${dispute.id}`,
      notification_type: 'dispute',
      priority: 'high',
    });

    console.log('Dispute created successfully:', dispute.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        dispute,
        coolingOffPeriodEnd: coolingOffEnd,
        evidenceDeadline,
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in create-dispute:', error);
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