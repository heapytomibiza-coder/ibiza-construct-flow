import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, data?: any) => {
  console.log(`[REQUEST-PAYOUT] ${step}`, data ? JSON.stringify(data) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { amount, currency = "USD" } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    logStep("User authenticated", { userId: user.id });

    // Get payout account
    const { data: payoutAccount, error: accountError } = await supabaseClient
      .from("payout_accounts")
      .select("*")
      .eq("professional_id", user.id)
      .single();

    if (accountError || !payoutAccount) {
      throw new Error("No payout account found. Please set up your payout account first.");
    }

    if (!payoutAccount.payouts_enabled) {
      throw new Error("Payouts are not enabled for your account yet. Please complete account setup.");
    }

    logStep("Payout account found", { accountId: payoutAccount.stripe_account_id });

    // Check available earnings
    const { data: earnings, error: earningsError } = await supabaseClient
      .from("professional_earnings")
      .select("net_amount")
      .eq("professional_id", user.id)
      .eq("status", "available");

    if (earningsError) {
      throw earningsError;
    }

    const availableAmount = earnings?.reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;

    if (availableAmount < amount) {
      throw new Error(`Insufficient available balance. Available: ${availableAmount}`);
    }

    logStep("Available balance checked", { available: availableAmount, requested: amount });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      destination: payoutAccount.stripe_account_id,
      description: `Payout to ${user.email}`,
    });

    logStep("Transfer created", { transferId: transfer.id });

    // Create payout record
    const { data: payout, error: payoutError } = await supabaseClient
      .from("professional_payouts")
      .insert({
        professional_id: user.id,
        payout_account_id: payoutAccount.id,
        amount,
        currency,
        status: "processing",
        stripe_transfer_id: transfer.id,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (payoutError) {
      throw payoutError;
    }

    logStep("Payout record created", { payoutId: payout.id });

    // Update earnings status
    const { error: updateError } = await supabaseClient
      .from("professional_earnings")
      .update({
        status: "paid",
        payout_id: payout.id,
      })
      .eq("professional_id", user.id)
      .eq("status", "available")
      .lte("net_amount", amount);

    if (updateError) {
      logStep("Error updating earnings", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        payout: {
          id: payout.id,
          amount,
          currency,
          status: "processing",
          transferId: transfer.id,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logStep("Error", error);
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
