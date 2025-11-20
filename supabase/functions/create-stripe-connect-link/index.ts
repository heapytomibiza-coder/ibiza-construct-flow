import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { serverClient } from "../_shared/client.ts";
import { json } from "../_shared/json.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = serverClient(req);

  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    if (!STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY not configured");
      return json({ error: "Payment service not configured" }, 500);
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
    });

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return json({ error: "Profile not found" }, 404);
    }

    // Check if payout account already exists
    const { data: existingAccount, error: accountError } = await supabase
      .from("payout_accounts")
      .select("stripe_account_id, provider")
      .eq("professional_id", user.id)
      .eq("provider", "stripe")
      .single();

    let accountId: string;

    if (existingAccount?.stripe_account_id) {
      // Use existing Stripe account
      accountId = existingAccount.stripe_account_id;
      console.log(`Using existing Stripe account: ${accountId}`);
    } else {
      // Create new Stripe Connect account
      const account = await stripe.accounts.create({
        type: "express",
        email: profile.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          user_id: user.id,
          user_name: profile.full_name,
        },
      });

      accountId = account.id;
      console.log(`Created new Stripe account: ${accountId}`);

      // Store in database
      const { error: insertError } = await supabase
        .from("payout_accounts")
        .insert({
          professional_id: user.id,
          provider: "stripe",
          stripe_account_id: accountId,
          charges_enabled: false,
          payouts_enabled: false,
          details_submitted: false,
        });

      if (insertError) {
        console.error("Failed to store payout account:", insertError);
        // Continue anyway - account is created in Stripe
      }
    }

    // Create account link for onboarding
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/professional/payout-setup?refresh=true`,
      return_url: `${origin}/professional/payout-setup?success=true`,
      type: "account_onboarding",
    });

    console.log(`Created onboarding link for account: ${accountId}`);

    return json({
      url: accountLink.url,
      accountId: accountId,
    });

  } catch (error) {
    console.error("Create Stripe Connect link error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: errorMessage }, 500);
  }
});
