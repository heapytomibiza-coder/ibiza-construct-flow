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

    const { contractId, notes, attachments } = await req.json();
    if (!contractId) throw new Error("Contract ID required");

    // Verify user is the professional on this contract
    const { data: contract, error: contractError } = await supabaseClient
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('tasker_id', user.id)
      .single();

    if (contractError || !contract) {
      throw new Error("Contract not found or unauthorized");
    }

    // Create work submission
    const { data: submission, error: submissionError } = await supabaseClient
      .from('work_submissions')
      .insert({
        contract_id: contractId,
        submitted_by: user.id,
        submission_notes: notes,
        attachments: attachments || [],
        status: 'pending',
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    // Update contract
    await supabaseClient
      .from('contracts')
      .update({ 
        work_submitted_at: new Date().toISOString(),
        // Auto-release after 7 days if no action
        auto_release_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', contractId);

    // Notify client
    await supabaseClient
      .from('activity_feed')
      .insert({
        user_id: contract.client_id,
        event_type: 'work_submitted',
        entity_type: 'contract',
        entity_id: contractId,
        title: 'Work Submitted for Review',
        description: 'The professional has completed work and is awaiting your approval.',
        action_url: `/contract/${contractId}`,
        notification_type: 'contract',
        priority: 'high',
      });

    return new Response(JSON.stringify({ success: true, submission }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error submitting work:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
