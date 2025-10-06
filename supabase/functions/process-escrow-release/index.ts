import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    const { milestone_id } = await req.json();

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
      destination: milestone.contract.professional_id, // This should be the Stripe Connect account ID
      transfer_group: milestone.contract.stripe_payment_intent_id,
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
        transfer_id: transfer.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing escrow release:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
