import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getErrorMessage } from "../_shared/errorUtils.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[STRIPE-CONNECT-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

/**
 * Atomic claim pattern for webhook idempotency
 */
async function claimEvent(
  supabase: ReturnType<typeof createClient>,
  eventId: string,
  eventType: string
): Promise<{ claimed: boolean }> {
  try {
    const { error } = await supabase
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
      if (error.code === "23505") {
        logStep("Event already claimed/processed", { eventId });
        return { claimed: false };
      }
      throw error;
    }

    return { claimed: true };
  } catch {
    return { claimed: false };
  }
}

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
}

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
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET") || Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logStep(`Processing Stripe Connect webhook: ${event.type}`, { eventId: event.id });

    // === ATOMIC CLAIM PATTERN ===
    const claimResult = await claimEvent(supabase, event.id, event.type);
    
    if (!claimResult.claimed) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    try {
      let result: Record<string, unknown> = {};

      switch (event.type) {
        case "account.updated": {
          const account = event.data.object as Stripe.Account;
          
          await supabase
            .from("professional_stripe_accounts")
            .update({
              charges_enabled: account.charges_enabled,
              payouts_enabled: account.payouts_enabled,
              details_submitted: account.details_submitted,
              account_status: account.charges_enabled && account.payouts_enabled ? "active" : "pending",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_account_id", account.id);
          
          result = { accountId: account.id, status: account.charges_enabled ? "active" : "pending" };
          logStep(`Updated account status for ${account.id}`);
          break;
        }

        case "transfer.created":
        case "transfer.updated": {
          const transfer = event.data.object as Stripe.Transfer;
          
          await supabase
            .from("escrow_transfer_logs")
            .update({
              status: transfer.reversed ? "reversed" : "succeeded",
              completed_at: new Date().toISOString(),
            })
            .eq("stripe_transfer_id", transfer.id);
          
          result = { transferId: transfer.id };
          logStep(`Updated transfer ${transfer.id}`);
          break;
        }

        case "transfer.failed": {
          const transfer = event.data.object as Stripe.Transfer;
          
          await supabase
            .from("escrow_transfer_logs")
            .update({
              status: "failed",
              failure_reason: (transfer as unknown as { failure_message?: string }).failure_message || "Transfer failed",
              completed_at: new Date().toISOString(),
            })
            .eq("stripe_transfer_id", transfer.id);
          
          result = { transferId: transfer.id, status: "failed" };
          logStep(`Transfer failed: ${transfer.id}`);
          break;
        }

        case "balance.available": {
          const balance = event.data.object as Stripe.Balance;
          const accountId = req.headers.get("stripe-account");
          
          if (accountId && balance.available?.[0]) {
            await supabase
              .from("professional_stripe_accounts")
              .update({
                balance_available: balance.available[0]?.amount || 0,
                balance_pending: balance.pending?.[0]?.amount || 0,
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_account_id", accountId);
            
            result = { accountId, available: balance.available[0]?.amount };
          }
          break;
        }

        default:
          logStep(`Unhandled event type: ${event.type}`);
          result = { unhandled: true };
      }

      await markProcessed(supabase, event.id, result);

      return new Response(JSON.stringify({ received: true, ...result }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });

    } catch (processingError) {
      await markFailed(supabase, event.id, getErrorMessage(processingError));
      throw processingError;
    }

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
