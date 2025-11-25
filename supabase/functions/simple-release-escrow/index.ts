import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Not authenticated");

    const { contractId } = await req.json();
    if (!contractId) throw new Error("Contract ID required");

    // Get contract details
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      throw new Error("Contract not found");
    }

    // Verify user is the client
    if (contract.client_id !== user.id) {
      throw new Error("Unauthorized");
    }

    // Check if work was approved
    if (contract.escrow_status !== 'ready_for_release' && contract.escrow_status !== 'funded') {
      throw new Error("Escrow not ready for release");
    }

    // Calculate amounts with commission
    const commissionRate = contract.commission_rate || 0.20;
    const platformFee = contract.platform_fee || 0.025;
    
    const agreedAmount = Number(contract.agreed_amount);
    const commissionAmount = Math.round(agreedAmount * commissionRate);
    const platformFeeAmount = Math.round(agreedAmount * platformFee);
    const professionalAmount = agreedAmount - commissionAmount - platformFeeAmount;

    // Create escrow release record
    const { data: release, error: releaseError } = await supabaseClient
      .from('simple_escrow_releases')
      .insert({
        contract_id: contractId,
        amount: professionalAmount,
        currency: 'eur',
        released_to: contract.tasker_id,
        released_by: user.id,
        release_reason: 'Work approved and completed',
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (releaseError) throw releaseError;

    // Update contract
    await supabaseClient
      .from('contracts')
      .update({
        escrow_status: 'released',
      })
      .eq('id', contractId);

    // Create payment transaction for professional
    await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: contract.tasker_id,
        transaction_type: 'payout',
        amount: professionalAmount,
        currency: 'eur',
        status: 'completed',
        job_id: contract.job_id,
        metadata: {
          contract_id: contractId,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          platform_fee_amount: platformFeeAmount,
          original_amount: agreedAmount,
        },
      });

    // Notify professional
    await supabaseClient
      .from('activity_feed')
      .insert({
        user_id: contract.tasker_id,
        event_type: 'payment_released',
        entity_type: 'payment',
        entity_id: release.id,
        title: 'Payment Released!',
        description: `You've received €${(professionalAmount / 100).toFixed(2)} for completed work.`,
        action_url: `/contract/${contractId}`,
        notification_type: 'payment',
        priority: 'high',
      });

    return new Response(JSON.stringify({ 
      success: true, 
      release,
      professionalAmount,
      commissionAmount,
      platformFeeAmount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error releasing escrow:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
