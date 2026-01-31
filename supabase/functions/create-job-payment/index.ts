import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
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

const jobPaymentSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount exceeds maximum allowed'),
  currency: z.enum(['EUR', 'USD', 'GBP'], {
    errorMap: () => ({ message: 'Currency must be EUR, USD, or GBP' })
  }).default('EUR')
});

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-JOB-PAYMENT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }
    logStep("User authenticated", { userId: user.id });

    // Rate limiting - PAYMENT_STRICT (5 req/hr, fail-closed)
    const clientId = getClientIdentifier(req, user.id);
    const rl = await checkRateLimitDb(serviceClient, clientId, 'create-job-payment', 'PAYMENT_STRICT');
    if (!rl.allowed) {
      logStep("Rate limit exceeded", { clientId });
      return createRateLimitResponse(rl);
    }

    // Validate request body
    const { jobId, amount, currency } = await validateRequestBody(req, jobPaymentSchema);

    // Get job details
    const { data: job, error: jobError } = await supabaseClient
      .from("jobs")
      .select("*, client_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error("Job not found");
    }

    // Verify user is the job client
    if (job.client_id !== user.id) {
      throw new Error("Unauthorized: Not the job owner");
    }

    logStep("Job verified", { jobId, clientId: job.client_id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: (currency || 'EUR').toLowerCase(),
      customer: customerId,
      metadata: {
        job_id: jobId,
        user_id: user.id,
        request_id: requestId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logStep("PaymentIntent created", { paymentIntentId: paymentIntent.id });

    // Create payment transaction record
    const { error: transactionError } = await supabaseClient
      .from("payment_transactions")
      .insert({
        user_id: user.id,
        job_id: jobId,
        amount: amount,
        currency: currency,
        status: "pending",
        payment_method: "card",
        stripe_payment_intent_id: paymentIntent.id,
        metadata: {
          client_secret: paymentIntent.client_secret,
          request_id: requestId,
        },
      });

    if (transactionError) {
      logStep("Error creating transaction", { error: transactionError.message });
      throw new Error("Failed to create payment transaction");
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
    logError('create-job-payment', error, { requestId });
    return createErrorResponse(error, requestId);
  }
});
