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

// Line item schema for booking items
const lineItemSchema = z.object({
  serviceName: z.string().max(200),
  professionalName: z.string().max(200).optional(),
  pricePerUnit: z.number().positive().max(100000),
  quantity: z.number().int().positive().max(100),
});

const bookingPaymentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  amount: z.number().positive().max(1000000),
  items: z.array(lineItemSchema).min(1).max(50),
});

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-BOOKING-PAYMENT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    // Rate limiting - PAYMENT_STANDARD (10 req/hr, fail-closed)
    const clientId = getClientIdentifier(req, user.id);
    const rl = await checkRateLimitDb(serviceClient, clientId, 'create-booking-payment', 'PAYMENT_STANDARD');
    if (!rl.allowed) {
      logStep("Rate limit exceeded", { clientId });
      return createRateLimitResponse(rl);
    }

    // Validate request body
    const { bookingId, amount, items } = await validateRequestBody(req, bookingPaymentSchema);

    logStep("Processing payment", { bookingId, amount, itemCount: items.length });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create line items from booking items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.serviceName,
          description: item.professionalName ? `Service by ${item.professionalName}` : undefined,
        },
        unit_amount: Math.round(item.pricePerUnit * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-confirmation/${bookingId}?payment=success`,
      cancel_url: `${req.headers.get("origin")}/service?payment=canceled`,
      metadata: {
        booking_id: bookingId,
        user_id: user.id,
        request_id: requestId,
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id, requestId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logError('create-booking-payment', error, { requestId });
    return createErrorResponse(error, requestId);
  }
});
