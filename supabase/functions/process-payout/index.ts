import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { payoutId } = await req.json();
    console.log("[process-payout] Request:", { payoutId });

    if (!payoutId) {
      throw new Error("Missing payoutId");
    }

    // Get payout details
    const { data: payout, error: payoutError } = await supabase
      .from("payouts")
      .select("*")
      .eq("id", payoutId)
      .single();

    if (payoutError || !payout) {
      throw new Error("Payout not found");
    }

    if (payout.status !== "pending") {
      throw new Error(`Cannot process payout with status: ${payout.status}`);
    }

    console.log("[process-payout] Processing payout:", payout.id);

    // NOTE: In a real implementation, you would:
    // 1. Set up Stripe Connect for professionals
    // 2. Create transfers to their connected accounts
    // For now, we'll simulate the payout process

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Simulate payout (in production, this would be a real Stripe transfer)
    // const transfer = await stripe.transfers.create({
    //   amount: Math.round(payout.amount * 100),
    //   currency: payout.currency.toLowerCase(),
    //   destination: payout.stripe_account_id,
    //   metadata: {
    //     payout_id: payout.id,
    //     professional_id: payout.professional_id
    //   }
    // });

    // For now, just mark as in_transit
    const arrivalDate = new Date();
    arrivalDate.setDate(arrivalDate.getDate() + 2); // 2 days from now

    const { error: updateError } = await supabase
      .from("payouts")
      .update({
        status: "in_transit",
        arrival_date: arrivalDate.toISOString().split("T")[0],
        // stripe_payout_id: transfer.id, // Would be set in production
        method: "bank_transfer",
      })
      .eq("id", payoutId);

    if (updateError) {
      console.error("[process-payout] Update error:", updateError);
      throw updateError;
    }

    // Create activity notification
    await supabase.from("activity_feed").insert({
      user_id: payout.professional_id,
      event_type: "payout_initiated",
      entity_type: "payout",
      entity_id: payoutId,
      title: "Payout Initiated",
      description: `Your payout of ${payout.currency} ${payout.amount} is being processed`,
      metadata: {
        arrival_date: arrivalDate.toISOString(),
      },
    });

    console.log("[process-payout] Successfully initiated payout");

    return new Response(
      JSON.stringify({
        success: true,
        payout: {
          ...payout,
          status: "in_transit",
          arrival_date: arrivalDate.toISOString().split("T")[0],
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[process-payout] Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
