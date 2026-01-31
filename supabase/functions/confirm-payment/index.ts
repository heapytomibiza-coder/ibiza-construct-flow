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

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = generateRequestId();

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const serviceClient = createServiceClient();

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Rate limiting - PAYMENT_STANDARD (10 req/hr, fail-closed)
    const clientId = getClientIdentifier(req, user.id);
    const rl = await checkRateLimitDb(serviceClient, clientId, 'confirm-payment', 'PAYMENT_STANDARD');
    if (!rl.allowed) {
      return createRateLimitResponse(rl);
    }

    // Validate input
    const { paymentIntentId } = await validateRequestBody(req, confirmPaymentSchema);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check current status first (idempotency)
    const { data: existingTransaction } = await supabaseClient
      .from("payment_transactions")
      .select("id, status")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    // If already in final state, return early (idempotent)
    if (existingTransaction?.status === 'completed' && paymentIntent.status === 'succeeded') {
      return new Response(
        JSON.stringify({
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          duplicate: true,
          requestId,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Update payment transaction status (only if state changed)
    const newStatus = paymentIntent.status === "succeeded" ? "completed" : paymentIntent.status;
    
    const { error: updateError } = await supabaseClient
      .from("payment_transactions")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentIntentId)
      .neq("status", newStatus); // Only update if status is different

    if (updateError && updateError.code !== 'PGRST116') {
      console.error("Error updating transaction:", updateError);
      throw new Error("Failed to update payment transaction");
    }

    // If payment succeeded, update job status
    if (paymentIntent.status === "succeeded") {
      const jobId = paymentIntent.metadata.job_id;
      if (jobId) {
        await supabaseClient
          .from("jobs")
          .update({ status: "in_progress" })
          .eq("id", jobId);
      }
    }

    return new Response(
      JSON.stringify({
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        requestId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logError('confirm-payment', error, { requestId });
    return createErrorResponse(error, requestId);
  }
});
