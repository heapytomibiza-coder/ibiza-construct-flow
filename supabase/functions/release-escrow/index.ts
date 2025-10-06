import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[RELEASE-ESCROW] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { milestoneId, notes, partial, amount: partialAmount } = await req.json();
    if (!milestoneId) throw new Error("Milestone ID is required");

    // Get milestone with contract details
    const { data: milestone, error: milestoneError } = await supabaseClient
      .from('escrow_milestones')
      .select('*, contracts(*)')
      .eq('id', milestoneId)
      .single();

    if (milestoneError || !milestone) throw new Error("Milestone not found");
    logStep("Milestone retrieved", { milestoneId, status: milestone.status });

    // Verify user is authorized (client can release)
    if (milestone.contracts.client_id !== user.id) {
      throw new Error("Unauthorized - only client can release escrow");
    }

    // Check milestone is completed
    if (milestone.status !== 'completed') {
      throw new Error("Milestone must be completed before release");
    }

    // Get escrow payment
    const { data: escrowPayment, error: paymentError } = await supabaseClient
      .from('escrow_payments')
      .select('*')
      .eq('milestone_id', milestoneId)
      .eq('escrow_status', 'held')
      .single();

    if (paymentError || !escrowPayment) {
      throw new Error("No held escrow payment found for this milestone");
    }
    logStep("Escrow payment found", { escrowPaymentId: escrowPayment.id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get professional's Stripe Connect account
    const contract = milestone.contracts;
    const { data: stripeAccount, error: stripeAccountError } = await supabaseClient
      .from('professional_stripe_accounts')
      .select('*')
      .eq('professional_id', contract.tasker_id)
      .single();

    if (stripeAccountError || !stripeAccount) {
      logStep("Professional does not have a Stripe Connect account");
      throw new Error('Professional payment account not set up');
    }

    if (stripeAccount.account_status !== 'active') {
      throw new Error('Professional payment account is not active');
    }

    // Calculate release amount
    const releaseAmount = partial && partialAmount 
      ? partialAmount 
      : milestone.amount;

    // Create Stripe transfer to professional
    let stripeTransferId = null;
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(releaseAmount * 100), // Convert to cents
        currency: 'usd',
        destination: stripeAccount.stripe_account_id,
        description: `Payment for milestone: ${milestone.title}${partial ? ' (Partial)' : ''}`,
        metadata: {
          milestone_id: milestoneId,
          contract_id: milestone.contract_id,
          professional_id: contract.tasker_id,
          partial: partial ? 'true' : 'false',
        },
      });

      stripeTransferId = transfer.id;
      logStep('Stripe transfer created', { transferId: transfer.id, amount: releaseAmount });

      // Log the transfer
      await supabaseClient.from('escrow_transfer_logs').insert({
        milestone_id: milestoneId,
        stripe_transfer_id: stripeTransferId,
        amount: releaseAmount,
        status: 'succeeded',
        professional_account_id: stripeAccount.id,
        completed_at: new Date().toISOString(),
        metadata: { notes, partial },
      });
    } catch (stripeError: any) {
      logStep('Stripe transfer failed', { error: stripeError.message });
      
      // Log failed transfer
      await supabaseClient.from('escrow_transfer_logs').insert({
        milestone_id: milestoneId,
        amount: releaseAmount,
        status: 'failed',
        failure_reason: stripeError.message,
        professional_account_id: stripeAccount.id,
        metadata: { notes, partial },
      });

      throw new Error(`Payment transfer failed: ${stripeError.message}`);
    }

    // Update escrow payment status (full release only)
    if (!partial) {
      await supabaseClient
        .from('escrow_payments')
        .update({
          escrow_status: 'released',
          status: 'succeeded',
          released_at: new Date().toISOString(),
          released_by: user.id,
        })
        .eq('id', escrowPayment.id);
    }

    // Update milestone released amount
    const currentReleased = milestone.released_amount || 0;
    const newReleasedAmount = currentReleased + releaseAmount;
    
    await supabaseClient
      .from('escrow_milestones')
      .update({
        released_amount: newReleasedAmount,
        status: newReleasedAmount >= milestone.amount ? 'released' : milestone.status,
      })
      .eq('id', milestoneId);

    // Create release transaction
    await supabaseClient
      .from('escrow_transactions')
      .insert({
        milestone_id: milestoneId,
        payment_id: escrowPayment.id,
        transaction_type: 'release',
        amount: releaseAmount,
        status: 'completed',
        initiated_by: user.id,
        completed_at: new Date().toISOString(),
        metadata: {
          professional_id: contract.tasker_id,
          stripe_transfer_id: stripeTransferId,
          notes,
          partial,
        },
      });

    // Create escrow release record
    await supabaseClient
      .from('escrow_releases')
      .insert({
        milestone_id: milestoneId,
        payment_id: escrowPayment.id,
        amount: releaseAmount,
        released_by: user.id,
        status: 'completed',
        released_at: new Date().toISOString(),
        notes,
      });

    logStep("Escrow released successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: partial ? 'Partial payment released successfully' : 'Escrow released successfully',
        amount: releaseAmount,
        transferId: stripeTransferId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
