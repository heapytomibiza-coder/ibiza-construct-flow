import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse } from '../_shared/errorMapping.ts';
import { checkRateLimit, STRICT_RATE_LIMIT } from '../_shared/rateLimiter.ts';

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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Check rate limit (20 requests per hour for payment operations)
    const rateLimitCheck = await checkRateLimit(
      supabaseClient,
      user.id,
      'create-job-payment',
      STRICT_RATE_LIMIT
    );

    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body
    const schema = z.object({
      jobId: z.string().uuid('Invalid job ID'),
      amount: z.number()
        .positive('Amount must be positive')
        .max(1000000, 'Amount exceeds maximum allowed')
        .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
      currency: z.enum(['EUR', 'USD', 'GBP'], {
        errorMap: () => ({ message: 'Currency must be EUR, USD, or GBP' })
      }).default('EUR')
    });

    const { jobId, amount, currency } = await validateRequestBody(req, schema);

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
      amount: Math.round(amount * 100), // Convert to cents
      currency: (currency || 'EUR').toLowerCase(),
      customer: customerId,
      metadata: {
        job_id: jobId,
        user_id: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

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
        },
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      throw new Error("Failed to create payment transaction");
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[create-job-payment] Error:', {
      error: errorMessage,
      stack: errorStack
    });
    return createErrorResponse(error);
  }
});
