import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  handleCors,
  corsHeaders,
  checkRateLimitDb,
  createRateLimitResponse,
  getClientIdentifier,
  validateRequestBody,
  createErrorResponse,
  logError,
  generateRequestId,
} from "../_shared/securityMiddleware.ts";

const processPayoutSchema = z.object({
  payoutId: z.string().uuid('Invalid payout ID'),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = generateRequestId();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Rate limiting - PAYMENT_STRICT (5 req/hr, fail-closed)
    // Note: This is an internal/admin operation, so we use IP-based limiting
    const clientId = getClientIdentifier(req);
    const rl = await checkRateLimitDb(supabase, clientId, 'process-payout', 'PAYMENT_STRICT');
    if (!rl.allowed) {
      return createRateLimitResponse(rl);
    }

    // Validate input
    const { payoutId } = await validateRequestBody(req, processPayoutSchema);
    console.log("[process-payout] Request:", { payoutId, requestId });

    // Get payout details
    const { data: payout, error: payoutError } = await supabase
      .from("payouts")
      .select("*")
      .eq("id", payoutId)
      .single();

    if (payoutError || !payout) {
      throw new Error("Payout not found");
    }

    if (payout.status !== "pending") {
      throw new Error(`Cannot process payout with status: ${payout.status}`);
    }

    console.log("[process-payout] Processing payout:", payout.id);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // For now, just mark as in_transit
    const arrivalDate = new Date();
    arrivalDate.setDate(arrivalDate.getDate() + 2);

    const { error: updateError } = await supabase
      .from("payouts")
      .update({
        status: "in_transit",
        arrival_date: arrivalDate.toISOString().split("T")[0],
        method: "bank_transfer",
      })
      .eq("id", payoutId);

    if (updateError) {
      console.error("[process-payout] Update error:", updateError);
      throw updateError;
    }

    // Create activity notification
    await supabase.from("activity_feed").insert({
      user_id: payout.professional_id,
      event_type: "payout_initiated",
      entity_type: "payout",
      entity_id: payoutId,
      title: "Payout Initiated",
      description: `Your payout of ${payout.currency} ${payout.amount} is being processed`,
      metadata: {
        arrival_date: arrivalDate.toISOString(),
        request_id: requestId,
      },
    });

    console.log("[process-payout] Successfully initiated payout");

    return new Response(
      JSON.stringify({
        success: true,
        payout: {
          ...payout,
          status: "in_transit",
          arrival_date: arrivalDate.toISOString().split("T")[0],
        },
        requestId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logError('process-payout', error, { requestId });
    return createErrorResponse(error, requestId);
  }
});
