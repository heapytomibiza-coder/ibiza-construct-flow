/**
 * Fund Escrow Edge Function
 * Holds client payment in escrow account for job
 * 
 * Flow:
 * 1. Verify user is job client
 * 2. Create Stripe PaymentIntent
 * 3. Create holding account entry
 * 4. Link payment to job
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const fundEscrowSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount exceeds maximum allowed'),
  currency: z.enum(['EUR', 'USD', 'GBP'], {
    errorMap: () => ({ message: 'Currency must be EUR, USD, or GBP' })
  }).default('EUR'),
  paymentMethodId: z.string().max(100).optional()
});

const logStep = (step: string, details?: any) => {
  console.log(`[FUND-ESCROW] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }
    logStep("User authenticated", { userId: user.id });

    // Rate limiting - PAYMENT_STRICT (5 req/hr, fail-closed)
    const clientId = getClientIdentifier(req, user.id);
    const rl = await checkRateLimitDb(serviceClient, clientId, 'fund-escrow', 'PAYMENT_STRICT');
    if (!rl.allowed) {
      logStep("Rate limit exceeded", { clientId });
      return createRateLimitResponse(rl);
    }

    // Validate request body
    const { jobId, amount, currency, paymentMethodId } = await validateRequestBody(req, fundEscrowSchema);

    // Verify user is job client
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select('id, client_id, status')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error("Job not found");
    }

    if (job.client_id !== user.id) {
      throw new Error("Unauthorized: Not job owner");
    }

    if (job.status !== 'open' && job.status !== 'in_progress') {
      throw new Error("Job not eligible for escrow funding");
    }

    logStep("Job verified", { jobId, status: job.status });

    // IDEMPOTENCY CHECK: Check for existing active escrow for this job
    const { data: existingEscrow } = await supabaseClient
      .from('escrow_payments')
      .select('id, stripe_payment_intent_id, amount, currency, escrow_status')
      .eq('job_id', jobId)
      .in('escrow_status', ['pending', 'funded', 'processing'])
      .maybeSingle();

    // If existing escrow found, return it (idempotent behavior)
    if (existingEscrow) {
      logStep("Existing escrow found - returning idempotent response", { 
        escrowId: existingEscrow.id,
        status: existingEscrow.escrow_status 
      });

      // Retrieve the client secret from Stripe if pending
      let clientSecret = null;
      if (existingEscrow.escrow_status === 'pending' && existingEscrow.stripe_payment_intent_id) {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2025-08-27.basil',
        });
        const existingIntent = await stripe.paymentIntents.retrieve(existingEscrow.stripe_payment_intent_id);
        clientSecret = existingIntent.client_secret;
      }

      return new Response(
        JSON.stringify({
          success: true,
          escrowId: existingEscrow.id,
          holdingAccountId: existingEscrow.id,
          stripePaymentIntentId: existingEscrow.stripe_payment_intent_id,
          clientSecret,
          amount: existingEscrow.amount,
          currency: existingEscrow.currency,
          status: existingEscrow.escrow_status,
          requestId,
          idempotent: true, // Flag indicating this was a duplicate request
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Create PaymentIntent with escrow metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: (currency || 'EUR').toLowerCase(),
      payment_method: paymentMethodId,
      confirm: paymentMethodId ? true : false,
      automatic_payment_methods: paymentMethodId ? undefined : { enabled: true },
      metadata: {
        job_id: jobId,
        client_id: user.id,
        escrow_hold: 'true',
        platform: 'constructive_solutions_ibiza',
        request_id: requestId,
      },
    });

    logStep("PaymentIntent created", { paymentIntentId: paymentIntent.id });

    // Create escrow holding account entry
    // DB has unique partial index: escrow_one_active_per_job to enforce single active escrow
    const { data: escrowData, error: escrowError } = await supabaseClient
      .from('escrow_payments')
      .insert({
        job_id: jobId,
        client_id: user.id,
        amount: amount,
        currency: currency,
        status: 'pending',
        escrow_status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        metadata: {
          payment_method_id: paymentMethodId,
          request_id: requestId,
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (escrowError) {
      // Handle race condition: another request created escrow between check and insert
      if (escrowError.code === '23505') { // unique_violation
        logStep('Race condition detected - fetching existing escrow');
        const { data: raceEscrow } = await supabaseClient
          .from('escrow_payments')
          .select('id, stripe_payment_intent_id, amount, currency, escrow_status')
          .eq('job_id', jobId)
          .in('escrow_status', ['pending', 'funded', 'processing'])
          .single();

        if (raceEscrow) {
          // Cancel the orphaned PaymentIntent we just created
          try {
            await stripe.paymentIntents.cancel(paymentIntent.id);
          } catch (cancelErr) {
            logStep('Failed to cancel orphaned PaymentIntent', { error: cancelErr });
          }

          return new Response(
            JSON.stringify({
              success: true,
              escrowId: raceEscrow.id,
              holdingAccountId: raceEscrow.id,
              stripePaymentIntentId: raceEscrow.stripe_payment_intent_id,
              amount: raceEscrow.amount,
              currency: raceEscrow.currency,
              status: raceEscrow.escrow_status,
              requestId,
              idempotent: true,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }
      }
      logStep('Escrow DB insert error', { error: escrowError.message, code: escrowError.code });
      throw new Error('Failed to create escrow record');
    }

    // Log transaction
    await supabaseClient
      .from('escrow_transactions')
      .insert({
        escrow_payment_id: escrowData.id,
        transaction_type: 'deposit',
        amount: amount,
        currency: currency,
        status: 'pending',
        initiated_by: user.id,
        metadata: {
          stripe_payment_intent_id: paymentIntent.id,
          job_id: jobId,
          request_id: requestId,
        },
      });

    logStep("Escrow record created", { escrowId: escrowData.id });

    return new Response(
      JSON.stringify({
        success: true,
        escrowId: escrowData.id,
        holdingAccountId: escrowData.id,
        stripePaymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: amount,
        currency: currency,
        status: 'pending',
        requestId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    logError('fund-escrow', error, { requestId });
    return createErrorResponse(error, requestId);
  }
});
