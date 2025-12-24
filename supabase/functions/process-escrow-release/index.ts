import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";
import Stripe from 'https://esm.sh/stripe@18.5.0';
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

const processReleaseSchema = z.object({
  milestone_id: z.string().uuid('Invalid milestone ID'),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const requestId = generateRequestId();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Rate limiting - PAYMENT_STRICT (5 req/hr, fail-closed)
    const clientId = getClientIdentifier(req, user.id);
    const rl = await checkRateLimitDb(supabase, clientId, 'process-escrow-release', 'PAYMENT_STRICT');
    if (!rl.allowed) {
      return createRateLimitResponse(rl);
    }

    // Validate input
    const { milestone_id } = await validateRequestBody(req, processReleaseSchema);

    // Get milestone details
    const { data: milestone, error: milestoneError } = await supabase
      .from('escrow_milestones')
      .select(`
        *,
        contract:escrow_contracts!inner(
          professional_id,
          stripe_payment_intent_id
        )
      `)
      .eq('id', milestone_id)
      .single();

    if (milestoneError) throw milestoneError;

    // Verify user is authorized (client of the contract)
    const { data: contract } = await supabase
      .from('escrow_contracts')
      .select('client_id')
      .eq('id', milestone.contract_id)
      .single();

    if (contract?.client_id !== user.id) {
      throw new Error('Unauthorized to release funds');
    }

    // Create Stripe transfer to professional
    const transfer = await stripe.transfers.create({
      amount: milestone.amount,
      currency: 'eur',
      destination: milestone.contract.professional_id,
      transfer_group: milestone.contract.stripe_payment_intent_id,
      metadata: {
        request_id: requestId,
      },
    });

    // Record the release
    const { error: releaseError } = await supabase
      .from('escrow_releases')
      .insert({
        milestone_id: milestone_id,
        amount: milestone.amount,
        status: 'completed',
        stripe_transfer_id: transfer.id,
        released_by: user.id,
        released_at: new Date().toISOString(),
      });

    if (releaseError) throw releaseError;

    // Update milestone status
    await supabase
      .from('escrow_milestones')
      .update({ 
        status: 'released',
        released_amount: milestone.amount,
      })
      .eq('id', milestone_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transfer_id: transfer.id,
        requestId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logError('process-escrow-release', error, { requestId });
    return createErrorResponse(error, requestId);
  }
});
