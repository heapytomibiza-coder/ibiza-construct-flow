import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse } from '../_shared/errorMapping.ts';
import { checkRateLimit, STRICT_RATE_LIMIT } from '../_shared/rateLimiter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error('User not authenticated');

    // Check rate limit (10 requests per hour for payment operations)
    const rateLimitCheck = await checkRateLimit(
      supabaseClient,
      user.id,
      'create-escrow-payment',
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
      contractId: z.string().uuid('Invalid contract ID'),
      amount: z.number()
        .positive('Amount must be positive')
        .max(1000000, 'Amount exceeds maximum allowed')
        .multipleOf(0.01, 'Amount must have at most 2 decimal places')
    });

    const { contractId, amount } = await validateRequestBody(req, schema);

    // Verify user is the client for this contract
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .select('client_id, job_id, jobs(title)')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) throw new Error('Contract not found');
    if (contract.client_id !== user.id) throw new Error('Unauthorized');

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Escrow Payment - ${contract.jobs?.title || 'Job'}`,
              description: `Secure escrow payment for contract`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/contracts/${contractId}?payment=success`,
      cancel_url: `${req.headers.get('origin')}/contracts/${contractId}?payment=cancelled`,
      metadata: {
        contractId,
        userId: user.id,
        type: 'escrow_funding',
      },
    });

    console.log('Checkout session created:', session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[create-escrow-payment] Error:', {
      error: error.message,
      stack: error.stack
    });
    return createErrorResponse(error);
  }
});
