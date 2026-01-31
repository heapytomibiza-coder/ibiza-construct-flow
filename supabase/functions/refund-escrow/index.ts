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
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { serverClient } from "../_shared/client.ts";
import {
  handleCors,
  corsHeaders,
  createServiceClient,
  checkRateLimitDb,
  createRateLimitResponse,
  getClientIdentifier,
  validateRequestBody,
  createErrorResponse,
  logError,
  generateRequestId,
} from "../_shared/securityMiddleware.ts";

const refundEscrowSchema = z.object({
  milestoneId: z.string().uuid('Invalid milestone ID'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000),
  amount: z.number().positive().max(1000000).optional(),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = generateRequestId();
  const supabase = serverClient(req);
  const serviceClient = createServiceClient();
  
  try {
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Rate limiting - PAYMENT_STRICT (5 req/hr, fail-closed)
    const clientId = getClientIdentifier(req, user.id);
    const rl = await checkRateLimitDb(serviceClient, clientId, 'refund-escrow', 'PAYMENT_STRICT');
    if (!rl.allowed) {
      return createRateLimitResponse(rl);
    }

    // Validate request body
    const { milestoneId, reason, amount } = await validateRequestBody(req, refundEscrowSchema);

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

    // Calculate remaining refundable amount from ledger (not just milestone amount)
    const { data: refundableData } = await supabase.rpc('get_refundable_amount', {
      p_escrow_payment_id: milestone.escrow_payment.id
    });
    
    const refundableAmount = refundableData || milestone.escrow_payment.amount;
    const requestedRefund = amount || milestone.amount;
    
    // Validate against cumulative cap
    if (requestedRefund > refundableAmount) {
      throw new Error(`Refund amount (${requestedRefund}) exceeds remaining refundable amount (${refundableAmount})`);
    }
    
    const refundAmount = requestedRefund;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: milestone.escrow_payment.stripe_payment_intent_id,
      amount: Math.round(refundAmount * 100),
      reason: 'requested_by_customer',
      metadata: {
        milestone_id: milestoneId,
        job_id: milestone.contract.job_id,
        refund_reason: reason,
        initiated_by: user.id,
        request_id: requestId,
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
          request_id: requestId,
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
        refundId: refundRecord?.id,
        stripeRefundId: refund.id,
        amount: refundAmount,
        status: 'refunded',
        requestId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    logError('refund-escrow', error, { requestId });
    return createErrorResponse(error, requestId);
  }
});
