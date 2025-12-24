import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  handleCors,
  corsHeaders,
  createServiceClient,
  checkRateLimitDb,
  createRateLimitResponse,
  getClientIdentifier,
  createErrorResponse,
  logError,
  generateRequestId,
} from "../_shared/securityMiddleware.ts";

const logStep = (step: string, data?: any) => {
  console.log(`[CREATE-CONNECT-ACCOUNT] ${step}`, data ? JSON.stringify(data) : "");
};

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = generateRequestId();

  try {
    logStep("Function started", { requestId });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const serviceClient = createServiceClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Rate limiting - PAYMENT_STANDARD (10 req/hr, fail-closed)
    const clientId = getClientIdentifier(req, user.id);
    const rl = await checkRateLimitDb(serviceClient, clientId, 'create-connect-account', 'PAYMENT_STANDARD');
    if (!rl.allowed) {
      logStep("Rate limit exceeded", { clientId });
      return createRateLimitResponse(rl);
    }

    // Check if user already has a payout account
    const { data: existingAccount } = await supabaseClient
      .from("payout_accounts")
      .select("*")
      .eq("professional_id", user.id)
      .maybeSingle();

    if (existingAccount) {
      logStep("Existing account found", { accountId: existingAccount.stripe_account_id });
      return new Response(
        JSON.stringify({
          accountId: existingAccount.stripe_account_id,
          status: "existing",
          onboardingComplete: existingAccount.details_submitted,
          requestId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        user_id: user.id,
        request_id: requestId,
      },
    });

    logStep("Stripe account created", { accountId: account.id });

    // Save to database
    const { error: insertError } = await supabaseClient
      .from("payout_accounts")
      .insert({
        professional_id: user.id,
        stripe_account_id: account.id,
        account_type: "express",
        charges_enabled: account.charges_enabled || false,
        payouts_enabled: account.payouts_enabled || false,
        details_submitted: account.details_submitted || false,
        country: account.country,
        currency: account.default_currency || "USD",
      });

    if (insertError) {
      logStep("Database insert error", insertError);
      throw insertError;
    }

    // Create account link for onboarding
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/payments?refresh=true`,
      return_url: `${origin}/payments?success=true`,
      type: "account_onboarding",
    });

    logStep("Account link created", { url: accountLink.url });

    return new Response(
      JSON.stringify({
        accountId: account.id,
        onboardingUrl: accountLink.url,
        status: "created",
        requestId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logError('create-connect-account', error, { requestId });
    return createErrorResponse(error, requestId);
  }
});
