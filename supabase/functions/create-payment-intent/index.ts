import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  handleCors,
  corsHeaders,
  createServiceClient,
  checkRateLimitDb,
  createRateLimitResponse,
  getClientIdentifier,
  validateRequestBody,
  createErrorResponse,
  logError,
  generateRequestId,
} from "../_shared/securityMiddleware.ts";

const paymentIntentSchema = z.object({
  amount: z.number().positive().max(999999),
  currency: z.string().trim().length(3).optional().default("USD"),
  jobId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-PAYMENT-INTENT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = generateRequestId();

  try {
    logStep("Function started", { requestId });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const serviceClient = createServiceClient();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Rate limiting - PAYMENT_STRICT (5 req/hr, fail-closed)
    const clientId = getClientIdentifier(req, user.id);
    const rl = await checkRateLimitDb(serviceClient, clientId, 'create-payment-intent', 'PAYMENT_STRICT');
    if (!rl.allowed) {
      logStep("Rate limit exceeded", { clientId });
      return createRateLimitResponse(rl);
    }

    // Validate input
    const { amount, currency, jobId, metadata } = await validateRequestBody(req, paymentIntentSchema);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: (currency || 'USD').toLowerCase(),
      customer: customerId,
      metadata: {
        userId: user.id,
        jobId: jobId || "",
        request_id: requestId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logStep("Payment intent created", { 
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency 
    });

    // Record transaction in database
    const { error: dbError } = await supabaseClient
      .from("payment_transactions")
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount,
        currency: currency,
        status: "pending",
        job_id: jobId,
        metadata: { ...metadata, request_id: requestId },
      });

    if (dbError) {
      logStep("Database error", { error: dbError.message });
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        requestId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logError('create-payment-intent', error, { requestId });
    return createErrorResponse(error, requestId);
  }
});
