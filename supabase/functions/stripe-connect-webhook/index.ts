import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Processing Stripe Connect webhook: ${event.type}`);

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
        
        console.log(`Updated account status for ${account.id}`);
        break;
      }

      case "transfer.created":
      case "transfer.updated": {
        const transfer = event.data.object as Stripe.Transfer;
        
        // Update transfer log
        await supabase
          .from("escrow_transfer_logs")
          .update({
            status: transfer.reversed ? "reversed" : "succeeded",
            completed_at: new Date().toISOString(),
          })
          .eq("stripe_transfer_id", transfer.id);
        
        console.log(`Updated transfer ${transfer.id}`);
        break;
      }

      case "transfer.failed": {
        const transfer = event.data.object as Stripe.Transfer;
        
        await supabase
          .from("escrow_transfer_logs")
          .update({
            status: "failed",
            failure_reason: (transfer as any).failure_message || "Transfer failed",
            completed_at: new Date().toISOString(),
          })
          .eq("stripe_transfer_id", transfer.id);
        
        console.log(`Transfer failed: ${transfer.id}`);
        break;
      }

      case "balance.available": {
        const balance = event.data.object as Stripe.Balance;
        
        // Update professional balance
        if (balance.connect_reserved) {
          const accountId = req.headers.get("stripe-account");
          if (accountId) {
            await supabase
              .from("professional_stripe_accounts")
              .update({
                balance_available: balance.available[0]?.amount || 0,
                balance_pending: balance.pending[0]?.amount || 0,
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_account_id", accountId);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
