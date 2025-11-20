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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { refundRequestId, amount, reason } = await req.json();

    if (!refundRequestId) {
      throw new Error("Missing refundRequestId");
    }

    // Get refund request details
    const { data: refundRequest, error: refundError } = await supabaseClient
      .from("refund_requests")
      .select("*, payment_id")
      .eq("id", refundRequestId)
      .single();

    if (refundError || !refundRequest) {
      throw new Error("Refund request not found");
    }

    // Get payment transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from("payment_transactions")
      .select("stripe_payment_intent_id, amount")
      .eq("id", refundRequest.payment_id)
      .single();

    if (transactionError || !transaction?.stripe_payment_intent_id) {
      throw new Error("Payment transaction not found or missing Stripe payment intent");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: transaction.stripe_payment_intent_id,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
      reason: reason || "requested_by_customer",
      metadata: {
        refund_request_id: refundRequestId,
        user_id: user.id,
      },
    });

    // Update refund request with Stripe refund ID
    const { error: updateError } = await supabaseClient
      .from("refund_requests")
      .update({
        status: "approved",
        admin_notes: `Stripe refund created: ${refund.id}`,
        stripe_refund_id: refund.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", refundRequestId);

    if (updateError) {
      console.error("Error updating refund request:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-payment-refund:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
