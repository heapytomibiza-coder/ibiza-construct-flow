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
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const { jobId, amount, currency = "USD" } = await req.json();
    console.log("[create-payment-intent] Request:", { jobId, amount, currency, userId: user.id });

    if (!jobId || !amount) {
      throw new Error("Missing required fields: jobId and amount");
    }

    // Get or create Stripe customer
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let stripeCustomerId: string;
    
    // Check if customer exists in our database
    const { data: existingCustomer } = await supabase
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (existingCustomer) {
      stripeCustomerId = existingCustomer.stripe_customer_id;
      console.log("[create-payment-intent] Found existing customer:", stripeCustomerId);
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      stripeCustomerId = customer.id;
      console.log("[create-payment-intent] Created new customer:", stripeCustomerId);

      // Save to database
      await supabase.from("stripe_customers").insert({
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        email: user.email
      });
    }

    // Calculate platform fee (10% of amount)
    const platformFee = Math.round(amount * 0.1);
    const netAmount = amount - platformFee;

    // Get job and professional details
    const { data: job } = await supabase
      .from("jobs")
      .select("title, client_id")
      .eq("id", jobId)
      .single();

    // Get professional from offer
    const { data: offer } = await supabase
      .from("offers")
      .select("tasker_id")
      .eq("job_id", jobId)
      .eq("status", "accepted")
      .single();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: stripeCustomerId,
      metadata: {
        job_id: jobId,
        user_id: user.id,
        professional_id: offer?.tasker_id || "",
        platform_fee: platformFee.toString(),
      },
      description: `Payment for: ${job?.title || "Job"}`,
    });

    console.log("[create-payment-intent] Created payment intent:", paymentIntent.id);

    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        job_id: jobId,
        client_id: user.id,
        professional_id: offer?.tasker_id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount,
        currency: currency,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("[create-payment-intent] Database error:", paymentError);
      throw paymentError;
    }

    console.log("[create-payment-intent] Created payment record:", payment.id);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: payment.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[create-payment-intent] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
