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
import { serverClient } from "../_shared/client.ts";
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

  const supabase = serverClient(req);
  
  try {
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check rate limit (20 requests per hour for escrow operations)
    const rateLimitCheck = await checkRateLimit(
      supabase,
      user.id,
      'fund-escrow',
      STRICT_RATE_LIMIT
    );

    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: corsHeaders }
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
      }).default('EUR'),
      paymentMethodId: z.string().optional()
    });

    const { jobId, amount, currency, paymentMethodId } = await validateRequestBody(req, schema);

    // Verify user is job client
    const { data: job, error: jobError } = await supabase
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

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Create PaymentIntent with escrow metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      confirm: paymentMethodId ? true : false,
      automatic_payment_methods: paymentMethodId ? undefined : { enabled: true },
      metadata: {
        job_id: jobId,
        client_id: user.id,
        escrow_hold: 'true',
        platform: 'constructive_solutions_ibiza',
      },
    });

    // Create escrow holding account entry
    const { data: escrowData, error: escrowError } = await supabase
      .from('escrow_payments')
      .insert({
        job_id: jobId,
        client_id: user.id,
        amount: amount,
        currency: currency,
        status: 'held',
        stripe_payment_intent_id: paymentIntent.id,
        metadata: {
          payment_method_id: paymentMethodId,
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (escrowError) {
      console.error('Escrow DB insert error:', escrowError);
      throw new Error('Failed to create escrow record');
    }

    // Log transaction
    await supabase
      .from('escrow_transactions')
      .insert({
        escrow_payment_id: escrowData.id,
        transaction_type: 'deposit',
        amount: amount,
        currency: currency,
        status: 'completed',
        initiated_by: user.id,
        metadata: {
          stripe_payment_intent_id: paymentIntent.id,
          job_id: jobId,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        escrowId: escrowData.id,
        holdingAccountId: escrowData.id,
        stripePaymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: amount,
        currency: currency,
        status: 'held',
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('[fund-escrow] Error:', {
      error: error.message,
      stack: error.stack
    });
    return createErrorResponse(error);
  }
});
