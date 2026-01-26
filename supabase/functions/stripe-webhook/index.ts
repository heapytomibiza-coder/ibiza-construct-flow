import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { json } from "../_shared/json.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getErrorMessage } from '../_shared/errorUtils.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

/**
 * Atomic claim pattern for webhook idempotency
 * Returns true if we successfully claimed the event, false if already processed
 */
async function claimEvent(
  supabase: ReturnType<typeof createClient>,
  eventId: string,
  eventType: string
): Promise<{ claimed: boolean; error?: string }> {
  try {
    // Try to insert with unique constraint on event_id (primary key)
    const { data, error } = await supabase
      .from("stripe_processed_events")
      .insert({
        event_id: eventId,
        event_type: eventType,
        status: "claimed",
        claimed_at: new Date().toISOString(),
      })
      .select("event_id")
      .single();

    if (error) {
      // Unique violation = already claimed/processed
      if (error.code === "23505") {
        logStep("Event already claimed/processed", { eventId });
        return { claimed: false };
      }
      throw error;
    }

    logStep("Event claimed successfully", { eventId });
    return { claimed: true };
  } catch (err) {
    // Only return "not claimed" for unique violation (duplicate)
    // Re-throw all other errors so Stripe retries
    if (err && typeof err === 'object' && 'code' in err && err.code === "23505") {
      logStep("Event already claimed (catch path)", { eventId });
      return { claimed: false };
    }
    logStep("Claim error - will rethrow", { eventId, error: getErrorMessage(err) });
    throw err;
  }
}

/**
 * Mark event as processed after successful handling
 */
async function markProcessed(
  supabase: ReturnType<typeof createClient>,
  eventId: string,
  result: Record<string, unknown> = {}
): Promise<void> {
  await supabase
    .from("stripe_processed_events")
    .update({
      status: "processed",
      processed_at: new Date().toISOString(),
      result,
    })
    .eq("event_id", eventId);

  logStep("Event marked as processed", { eventId });
}

/**
 * Mark event as failed for retry visibility
 */
async function markFailed(
  supabase: ReturnType<typeof createClient>,
  eventId: string,
  error: string
): Promise<void> {
  await supabase
    .from("stripe_processed_events")
    .update({
      status: "failed",
      processed_at: new Date().toISOString(),
      error_message: error,
      result: { error },
    })
    .eq("event_id", eventId);

  logStep("Event marked as failed", { eventId, error });
}

/**
 * Handle payment_intent.succeeded - Primary source of truth for escrow funding
 */
async function handlePaymentIntentSucceeded(
  supabase: ReturnType<typeof createClient>,
  intent: Stripe.PaymentIntent
): Promise<{ success: boolean; details: Record<string, unknown> }> {
  logStep("Handling payment_intent.succeeded", { 
    intentId: intent.id, 
    amount: intent.amount,
    metadata: intent.metadata 
  });

  // Update escrow_payments by stripe_payment_intent_id (idempotent via WHERE clause)
  const { data, error } = await supabase
    .from("escrow_payments")
    .update({
      status: "captured",
      escrow_status: "held",
      captured_at: new Date().toISOString(),
      stripe_charge_id: typeof intent.latest_charge === 'string' 
        ? intent.latest_charge 
        : intent.latest_charge?.id,
    })
    .eq("stripe_payment_intent_id", intent.id)
    .select("id, contract_id, job_id");

  if (error) {
    logStep("Error updating escrow_payments", { error: error.message });
    throw new Error(`Failed to update escrow payment: ${error.message}`);
  }

  // Also update payment_transactions if exists
  await supabase
    .from("payment_transactions")
    .update({
      status: "succeeded",
      stripe_charge_id: typeof intent.latest_charge === 'string' 
        ? intent.latest_charge 
        : intent.latest_charge?.id,
    })
    .eq("stripe_payment_intent_id", intent.id);

  // Update contract escrow_status if we have a contract_id in metadata
  if (intent.metadata?.contractId || (data && data[0]?.contract_id)) {
    const contractId = intent.metadata?.contractId || data?.[0]?.contract_id;
    await supabase
      .from("contracts")
      .update({
        escrow_status: "funded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", contractId);
  }

  return {
    success: true,
    details: {
      intentId: intent.id,
      amount: intent.amount,
      updatedRecords: data?.length || 0,
    },
  };
}

/**
 * Handle checkout.session.completed - For Checkout-based escrow funding
 */
async function handleCheckoutSessionCompleted(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session
): Promise<{ success: boolean; details: Record<string, unknown> }> {
  logStep("Handling checkout.session.completed", { 
    sessionId: session.id, 
    paymentStatus: session.payment_status,
    metadata: session.metadata 
  });

  // === CRITICAL: Only process if payment is actually confirmed ===
  if (session.payment_status !== "paid") {
    logStep("Checkout session not yet paid, skipping", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status 
    });
    return {
      success: true,
      details: { sessionId: session.id, ignored: true, reason: "not_paid" },
    };
  }

  const { contractId, type, userId } = session.metadata || {};

  if (type === "escrow_funding" && contractId) {
    // Update contract status
    const { error: contractError } = await supabase
      .from("contracts")
      .update({
        escrow_status: "funded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", contractId);

    if (contractError) {
      throw new Error(`Failed to update contract: ${contractError.message}`);
    }

    // Update payment transaction - FIX: use .filter for JSONB path query
    await supabase
      .from("payment_transactions")
      .update({
        status: "succeeded",
      })
      .filter("metadata->>sessionId", "eq", session.id);

    return {
      success: true,
      details: { contractId, sessionId: session.id },
    };
  }

  return {
    success: true,
    details: { sessionId: session.id, type: type || "unknown" },
  };
}

/**
 * Handle payment_intent.payment_failed
 */
async function handlePaymentIntentFailed(
  supabase: ReturnType<typeof createClient>,
  intent: Stripe.PaymentIntent
): Promise<{ success: boolean; details: Record<string, unknown> }> {
  logStep("Handling payment_intent.payment_failed", { intentId: intent.id });

  // Update escrow_payments
  await supabase
    .from("escrow_payments")
    .update({
      status: "failed",
      escrow_status: "failed",
      metadata: { 
        failure_code: intent.last_payment_error?.code,
        failure_message: intent.last_payment_error?.message,
      },
    })
    .eq("stripe_payment_intent_id", intent.id);

  // Update payment_transactions
  await supabase
    .from("payment_transactions")
    .update({
      status: "failed",
      metadata: {
        failure_code: intent.last_payment_error?.code,
        failure_message: intent.last_payment_error?.message,
      },
    })
    .eq("stripe_payment_intent_id", intent.id);

  return {
    success: true,
    details: {
      intentId: intent.id,
      failureCode: intent.last_payment_error?.code,
    },
  };
}

/**
 * Handle charge.refunded
 */
async function handleChargeRefunded(
  supabase: ReturnType<typeof createClient>,
  charge: Stripe.Charge
): Promise<{ success: boolean; details: Record<string, unknown> }> {
  logStep("Handling charge.refunded", { chargeId: charge.id });

  // Update escrow_payments by charge ID
  const { error } = await supabase
    .from("escrow_payments")
    .update({
      status: "refunded",
      escrow_status: "refunded",
      refunded_at: new Date().toISOString(),
    })
    .eq("stripe_charge_id", charge.id);

  if (error) {
    logStep("Error updating escrow_payments for refund", { error: error.message });
  }

  // Also try by payment_intent if charge has one
  if (charge.payment_intent) {
    await supabase
      .from("escrow_payments")
      .update({
        status: "refunded",
        escrow_status: "refunded",
        refunded_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", charge.payment_intent);
  }

  return {
    success: true,
    details: { chargeId: charge.id, refunded: charge.refunded },
  };
}

/**
 * Handle charge.dispute.created
 */
async function handleDisputeCreated(
  supabase: ReturnType<typeof createClient>,
  dispute: Stripe.Dispute
): Promise<{ success: boolean; details: Record<string, unknown> }> {
  logStep("Handling charge.dispute.created", { 
    disputeId: dispute.id, 
    chargeId: dispute.charge 
  });

  // Freeze related escrow
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
  if (chargeId) {
    await supabase.rpc("freeze_escrow_for_dispute", { p_charge_id: chargeId });
  }

  // Create/update dispute record (upsert for idempotency)
  const { error } = await supabase
    .from("stripe_disputes")
    .upsert({
      stripe_dispute_id: dispute.id,
      stripe_charge_id: chargeId,
      stripe_payment_intent_id: typeof dispute.payment_intent === 'string' 
        ? dispute.payment_intent 
        : dispute.payment_intent?.id,
      amount: dispute.amount,
      currency: dispute.currency,
      reason: dispute.reason,
      status: dispute.status,
      evidence_due_by: dispute.evidence_details?.due_by 
        ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
        : null,
    }, {
      onConflict: "stripe_dispute_id",
    });

  if (error) {
    throw new Error(`Failed to create dispute record: ${error.message}`);
  }

  return {
    success: true,
    details: { disputeId: dispute.id, reason: dispute.reason },
  };
}

/**
 * Handle charge.dispute.updated and charge.dispute.closed
 */
async function handleDisputeUpdated(
  supabase: ReturnType<typeof createClient>,
  dispute: Stripe.Dispute
): Promise<{ success: boolean; details: Record<string, unknown> }> {
  logStep("Handling dispute update", { disputeId: dispute.id, status: dispute.status });

  const updateData: Record<string, unknown> = {
    status: dispute.status,
    updated_at: new Date().toISOString(),
  };

  // If dispute is closed, record the close time
  if (["won", "lost", "charge_refunded"].includes(dispute.status)) {
    updateData.closed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("stripe_disputes")
    .update(updateData)
    .eq("stripe_dispute_id", dispute.id);

  if (error) {
    throw new Error(`Failed to update dispute: ${error.message}`);
  }

  return {
    success: true,
    details: { disputeId: dispute.id, status: dispute.status },
  };
}

/**
 * Handle account.updated (existing)
 */
async function handleAccountUpdated(
  supabase: ReturnType<typeof createClient>,
  account: Stripe.Account
): Promise<{ success: boolean; details: Record<string, unknown> }> {
  await supabase
    .from("payout_accounts")
    .update({
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    })
    .eq("stripe_account_id", account.id);

  return {
    success: true,
    details: { accountId: account.id },
  };
}

/**
 * Handle payout events (existing)
 */
async function handlePayoutEvent(
  supabase: ReturnType<typeof createClient>,
  payout: Stripe.Payout,
  eventType: string
): Promise<{ success: boolean; details: Record<string, unknown> }> {
  const status =
    eventType === "payout.paid" ? "completed" :
    eventType === "payout.failed" ? "failed" :
    "pending";

  await supabase
    .from("payout_accounts")
    .update({ status })
    .eq("stripe_account_id", payout.destination);

  return {
    success: true,
    details: { payoutId: payout.id, status },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      console.error("Stripe keys not configured");
      return json({ error: "Stripe not configured" }, 500);
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
    });

    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return json({ error: "Missing stripe-signature header" }, 400);
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", getErrorMessage(err));
      return json({ error: "Invalid signature" }, 400);
    }

    logStep(`Webhook received: ${event.type}`, { eventId: event.id });

    // Create Supabase client using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase keys not configured");
      return json({ error: "Database not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // === ATOMIC CLAIM PATTERN ===
    // Step 1: Try to claim the event (idempotency check)
    const claimResult = await claimEvent(supabase, event.id, event.type);
    
    if (!claimResult.claimed) {
      // Already processed - return success to Stripe but don't re-process
      return json({ received: true, duplicate: true, eventId: event.id });
    }

    // Step 2: Process the event
    try {
      let result: { success: boolean; details: Record<string, unknown> } = { 
        success: true, 
        details: {} 
      };

      switch (event.type) {
        // === PRIMARY PAYMENT EVENTS (Source of Truth) ===
        case "payment_intent.succeeded": {
          const intent = event.data.object as Stripe.PaymentIntent;
          result = await handlePaymentIntentSucceeded(supabase, intent);
          break;
        }

        case "payment_intent.payment_failed": {
          const intent = event.data.object as Stripe.PaymentIntent;
          result = await handlePaymentIntentFailed(supabase, intent);
          break;
        }

        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          result = await handleCheckoutSessionCompleted(supabase, session);
          break;
        }

        // === REFUND EVENTS ===
        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;
          result = await handleChargeRefunded(supabase, charge);
          break;
        }

        // === DISPUTE EVENTS ===
        case "charge.dispute.created": {
          const dispute = event.data.object as Stripe.Dispute;
          result = await handleDisputeCreated(supabase, dispute);
          break;
        }

        case "charge.dispute.updated":
        case "charge.dispute.closed": {
          const dispute = event.data.object as Stripe.Dispute;
          result = await handleDisputeUpdated(supabase, dispute);
          break;
        }

        // === ACCOUNT EVENTS (Existing) ===
        case "account.updated": {
          const account = event.data.object as Stripe.Account;
          result = await handleAccountUpdated(supabase, account);
          break;
        }

        case "payout.created":
        case "payout.paid":
        case "payout.failed": {
          const payout = event.data.object as Stripe.Payout;
          result = await handlePayoutEvent(supabase, payout, event.type);
          break;
        }

        case "account.external_account.created":
        case "account.external_account.updated": {
          const account = event.account;
          if (account) {
            await supabase
              .from("payout_accounts")
              .update({ details_submitted: true })
              .eq("stripe_account_id", account);
          }
          result = { success: true, details: { account } };
          break;
        }

        default:
          logStep(`Unhandled event type: ${event.type}`);
          result = { success: true, details: { unhandled: true } };
      }

      // Step 3: Mark as processed
      await markProcessed(supabase, event.id, result.details);

      return json({ received: true, eventId: event.id, ...result.details });

    } catch (processingError) {
      // Step 4: Mark as failed for retry visibility
      const errorMessage = getErrorMessage(processingError);
      await markFailed(supabase, event.id, errorMessage);
      
      // Re-throw so Stripe knows to retry
      throw processingError;
    }

  } catch (error) {
    console.error("Stripe webhook error:", error);
    return json({ error: getErrorMessage(error) }, 500);
  }
});
