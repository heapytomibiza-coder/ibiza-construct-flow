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

    const { paymentIntentId } = await req.json();
    console.log("[confirm-payment] Request:", { paymentIntentId });

    if (!paymentIntentId) {
      throw new Error("Missing paymentIntentId");
    }

    // Get payment intent from Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("[confirm-payment] Payment intent status:", paymentIntent.status);

    // Update payment record in database
    const { data: payment, error: updateError } = await supabase
      .from("payments")
      .update({
        status: paymentIntent.status === "succeeded" ? "succeeded" : paymentIntent.status,
        stripe_charge_id: paymentIntent.latest_charge as string,
        payment_method: paymentIntent.payment_method_types[0],
      })
      .eq("stripe_payment_intent_id", paymentIntentId)
      .select()
      .single();

    if (updateError) {
      console.error("[confirm-payment] Database error:", updateError);
      throw updateError;
    }

    console.log("[confirm-payment] Updated payment:", payment.id);

    // If payment succeeded, create escrow milestones
    if (paymentIntent.status === "succeeded" && payment.job_id) {
      // Create default milestone (full amount held in escrow)
      const { error: milestoneError } = await supabase
        .from("escrow_milestones")
        .insert({
          contract_id: payment.job_id, // Assuming contract exists
          payment_id: payment.id,
          milestone_number: 1,
          title: "Job Completion",
          description: "Full payment held in escrow",
          amount: payment.net_amount,
          status: "pending",
        });

      if (milestoneError) {
        console.error("[confirm-payment] Milestone creation error:", milestoneError);
      } else {
        console.log("[confirm-payment] Created escrow milestone");
      }

      // Create activity feed entry
      await supabase.from("activity_feed").insert({
        user_id: payment.client_id,
        event_type: "payment_succeeded",
        entity_type: "payment",
        entity_id: payment.id,
        title: "Payment Successful",
        description: `Your payment of ${payment.currency} ${payment.amount} has been processed`,
        action_url: `/jobs/${payment.job_id}`,
      });

      // Notify professional
      if (payment.professional_id) {
        await supabase.from("activity_feed").insert({
          user_id: payment.professional_id,
          event_type: "payment_received",
          entity_type: "payment",
          entity_id: payment.id,
          title: "Payment Received",
          description: `Client has paid ${payment.currency} ${payment.net_amount} (held in escrow)`,
          action_url: `/jobs/${payment.job_id}`,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment,
        status: paymentIntent.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[confirm-payment] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
