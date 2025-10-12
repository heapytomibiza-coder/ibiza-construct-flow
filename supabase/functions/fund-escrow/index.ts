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

    // Parse request
    const { jobId, amount, currency = 'EUR', paymentMethodId } = await req.json();

    if (!jobId || !amount || amount <= 0) {
      throw new Error("Invalid request: jobId and positive amount required");
    }

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
    console.error('Fund escrow error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to fund escrow'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
