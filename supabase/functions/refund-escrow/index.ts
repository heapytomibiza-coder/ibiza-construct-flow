/**
 * Refund Escrow Edge Function
 * Returns funds from escrow to client
 * 
 * Trigger conditions:
 * - Job cancelled before completion
 * - Dispute resolved in client favor
 * - Admin override
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { serverClient } from "../_shared/client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = serverClient(req);
  
  try {
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request
    const { milestoneId, reason, amount } = await req.json();

    if (!milestoneId || !reason || reason.length < 10) {
      throw new Error("Invalid request: milestoneId and detailed reason required");
    }

    // Fetch milestone + escrow payment
    const { data: milestone, error: milestoneError } = await supabase
      .from('escrow_milestones')
      .select(`
        *,
        contract:contracts!inner(
          id,
          client_id,
          tasker_id,
          job_id
        ),
        escrow_payment:escrow_payments!inner(
          id,
          client_id,
          amount,
          currency,
          status,
          stripe_payment_intent_id
        )
      `)
      .eq('id', milestoneId)
      .single();

    if (milestoneError || !milestone) {
      throw new Error("Milestone not found");
    }

    // Verify authorization (client or admin)
    const isClient = milestone.contract.client_id === user.id;
    const { data: isAdmin } = await supabase.rpc('has_role', {
      p_user: user.id,
      p_role: 'admin'
    });

    if (!isClient && !isAdmin) {
      throw new Error("Unauthorized: Only client or admin can request refund");
    }

    // Verify escrow status
    if (milestone.escrow_payment.status !== 'held') {
      throw new Error(`Cannot refund: escrow status is ${milestone.escrow_payment.status}`);
    }

    // Calculate refund amount
    const refundAmount = amount || milestone.amount;
    
    if (refundAmount > milestone.amount) {
      throw new Error("Refund amount exceeds milestone amount");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: milestone.escrow_payment.stripe_payment_intent_id,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: 'requested_by_customer',
      metadata: {
        milestone_id: milestoneId,
        job_id: milestone.contract.job_id,
        refund_reason: reason,
        initiated_by: user.id,
      },
    });

    // Update escrow payment status
    await supabase
      .from('escrow_payments')
      .update({
        status: refundAmount === milestone.amount ? 'refunded' : 'partially_refunded',
        refunded_at: new Date().toISOString(),
        refund_reason: reason,
      })
      .eq('id', milestone.escrow_payment.id);

    // Log refund transaction
    const { data: refundRecord } = await supabase
      .from('escrow_transactions')
      .insert({
        escrow_payment_id: milestone.escrow_payment.id,
        transaction_type: 'refund',
        amount: refundAmount,
        currency: milestone.escrow_payment.currency,
        status: 'completed',
        initiated_by: user.id,
        metadata: {
          stripe_refund_id: refund.id,
          reason: reason,
          milestone_id: milestoneId,
        },
      })
      .select()
      .single();

    // Update milestone status
    await supabase
      .from('escrow_milestones')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
      })
      .eq('id', milestoneId);

    return new Response(
      JSON.stringify({
        success: true,
        refundId: refundRecord.id,
        stripeRefundId: refund.id,
        amount: refundAmount,
        status: 'refunded',
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Refund escrow error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to process refund'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
