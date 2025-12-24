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

const processPaymentSchema = z.object({
  contractId: z.string().uuid('Invalid contract ID'),
  amount: z.number().positive().max(1000000),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = generateRequestId();

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const serviceClient = createServiceClient();

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Rate limiting - PAYMENT_STRICT (5 req/hr, fail-closed)
    const clientId = getClientIdentifier(req, user.id);
    const rl = await checkRateLimitDb(serviceClient, clientId, 'process-payment', 'PAYMENT_STRICT');
    if (!rl.allowed) {
      return createRateLimitResponse(rl);
    }

    // Validate input
    const { contractId, amount } = await validateRequestBody(req, processPaymentSchema);

    // Get contract details
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .select('*, job:job_id(title)')
      .eq('id', contractId)
      .single();

    if (contractError) throw contractError;

    // Verify user is the client
    if (contract.client_id !== user.id) {
      throw new Error("Unauthorized: Only the client can fund this contract");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate total with service fee
    const serviceFee = amount * 0.05;
    const totalAmount = Math.round((amount + serviceFee) * 100);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Escrow Payment - ${contract.job?.title || 'Service'}`,
              description: `Contract ID: ${contractId}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/contracts/${contractId}/success`,
      cancel_url: `${req.headers.get("origin")}/contracts/${contractId}/fund`,
      metadata: {
        contractId,
        userId: user.id,
        type: 'escrow_funding',
        request_id: requestId,
      },
    });

    // Log payment initiation
    await supabaseClient.from('payment_transactions').insert({
      user_id: user.id,
      amount: totalAmount / 100,
      currency: 'EUR',
      status: 'pending',
      transaction_id: session.id,
      payment_method: 'stripe',
      metadata: { contractId, sessionId: session.id, request_id: requestId },
    });

    return new Response(JSON.stringify({ url: session.url, requestId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logError('process-payment', error, { requestId });
    return createErrorResponse(error, requestId);
  }
});
