import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-ESCROW-PAYMENT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { milestoneId, paymentMethodId } = await req.json();
    if (!milestoneId) throw new Error("Milestone ID is required");

    // Get milestone details
    const { data: milestone, error: milestoneError } = await supabaseClient
      .from('escrow_milestones')
      .select('*, contracts(*)')
      .eq('id', milestoneId)
      .single();

    if (milestoneError || !milestone) throw new Error("Milestone not found");
    logStep("Milestone retrieved", { milestoneId, amount: milestone.amount });

    // Verify user is the client
    if (milestone.contracts.client_id !== user.id) {
      throw new Error("Unauthorized - only client can fund escrow");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
    }
    logStep("Customer retrieved", { customerId });

    // Create payment intent for escrow
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(milestone.amount * 100),
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        type: 'escrow',
        milestoneId: milestoneId,
        contractId: milestone.contract_id,
        userId: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    logStep("Payment intent created", { 
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status 
    });

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment failed');
    }

    // Create escrow payment record
    const { data: escrowPayment, error: escrowError } = await supabaseClient
      .from('escrow_payments')
      .insert({
        milestone_id: milestoneId,
        contract_id: milestone.contract_id,
        amount: milestone.amount,
        status: 'pending',
        escrow_status: 'held',
      })
      .select()
      .single();

    if (escrowError) throw escrowError;
    logStep("Escrow payment created", { escrowPaymentId: escrowPayment.id });

    // Create escrow transaction record
    await supabaseClient
      .from('escrow_transactions')
      .insert({
        milestone_id: milestoneId,
        payment_id: escrowPayment.id,
        transaction_type: 'deposit',
        amount: milestone.amount,
        status: 'completed',
        initiated_by: user.id,
        completed_at: new Date().toISOString(),
        metadata: {
          stripe_payment_intent_id: paymentIntent.id,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        escrowPaymentId: escrowPayment.id,
        paymentIntentId: paymentIntent.id,
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
