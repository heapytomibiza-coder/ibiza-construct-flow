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

const escrowPaymentSchema = z.object({
  contractId: z.string().uuid('Invalid contract ID'),
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount exceeds maximum allowed'),
});

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-ESCROW-PAYMENT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = generateRequestId();

  try {
    logStep("Function started", { requestId });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const serviceClient = createServiceClient();

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error('User not authenticated');
    logStep("User authenticated", { userId: user.id });

    // Rate limiting - PAYMENT_STRICT (5 req/hr, fail-closed)
    const clientId = getClientIdentifier(req, user.id);
    const rl = await checkRateLimitDb(serviceClient, clientId, 'create-escrow-payment', 'PAYMENT_STRICT');
    if (!rl.allowed) {
      logStep("Rate limit exceeded", { clientId });
      return createRateLimitResponse(rl);
    }

    // Validate request body
    const { contractId, amount } = await validateRequestBody(req, escrowPaymentSchema);

    // Verify user is the client for this contract
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .select('client_id, job_id, jobs(title)')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) throw new Error('Contract not found');
    if (contract.client_id !== user.id) throw new Error('Unauthorized');

    logStep("Contract verified", { contractId, jobId: contract.job_id });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;
    logStep("Customer lookup", { customerId: customerId || 'new' });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Escrow Payment - ${(contract.jobs as any)?.title || 'Job'}`,
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
        request_id: requestId,
      },
    });

    logStep('Checkout session created', { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id, requestId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    logError('create-escrow-payment', error, { requestId });
    return createErrorResponse(error, requestId);
  }
});
