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

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { paymentId, amount, currency = "EUR" } = await req.json();

    if (!paymentId || !amount) {
      throw new Error("Missing required fields");
    }

    // Get scheduled payment details
    const { data: scheduledPayment, error: paymentError } = await supabaseClient
      .from("scheduled_payments")
      .select("*, schedule:payment_schedules(*)")
      .eq("id", paymentId)
      .single();

    if (paymentError || !scheduledPayment) {
      throw new Error("Scheduled payment not found");
    }

    // Verify user owns the schedule
    if (scheduledPayment.schedule.user_id !== user.id) {
      throw new Error("Unauthorized");
    }

    // Check if already paid
    if (scheduledPayment.status === "paid") {
      throw new Error("This installment has already been paid");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        scheduled_payment_id: paymentId,
        schedule_id: scheduledPayment.schedule_id,
        installment_number: scheduledPayment.installment_number,
        user_id: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update scheduled payment status
    await supabaseClient
      .from("scheduled_payments")
      .update({
        status: "processing",
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    // Create payment transaction record
    await supabaseClient.from("payment_transactions").insert({
      user_id: user.id,
      job_id: scheduledPayment.schedule.job_id,
      amount: amount,
      currency: currency,
      status: "pending",
      payment_method: "card",
      stripe_payment_intent_id: paymentIntent.id,
      metadata: {
        scheduled_payment_id: paymentId,
        installment_number: scheduledPayment.installment_number,
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in process-installment-payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
