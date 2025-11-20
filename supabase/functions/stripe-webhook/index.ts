import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { json } from "../_shared/json.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getErrorMessage } from '../_shared/errorUtils.ts';

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

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

    console.log(`Webhook received: ${event.type}`);

    // Create Supabase client using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase keys not configured");
      return json({ error: "Database not configured" }, 500);
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log the event
    await supabase.from("stripe_events").insert({
      event_id: event.id,
      event_type: event.type,
      account_id: event.account || null,
      data: event.data.object,
    });

    // Handle specific event types
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        
        // Update payout account
        await supabase
          .from("payout_accounts")
          .update({
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
          })
          .eq("stripe_account_id", account.id);

        console.log(`Updated payout account: ${account.id}`);
        break;
      }

      case "payout.created":
      case "payout.paid":
      case "payout.failed": {
        const payout = event.data.object as Stripe.Payout;
        
        const status = 
          event.type === "payout.paid" ? "completed" :
          event.type === "payout.failed" ? "failed" :
          "pending";

        await supabase
          .from("payout_accounts")
          .update({ status })
          .eq("stripe_account_id", payout.destination);

        console.log(`Payout ${status}: ${payout.id}`);
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
          
          console.log(`External account updated: ${account}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });

  } catch (error) {
    console.error("Stripe webhook error:", error);
    return json({ error: getErrorMessage(error) }, 500);
  }
});
