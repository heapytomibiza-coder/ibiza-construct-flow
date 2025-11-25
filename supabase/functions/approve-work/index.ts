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

    const { submissionId, approved, reviewNotes } = await req.json();
    if (!submissionId) throw new Error("Submission ID required");

    // Get submission and contract
    const { data: submission, error: submissionError } = await supabaseClient
      .from('work_submissions')
      .select('*, contracts(*)')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      throw new Error("Submission not found");
    }

    // Verify user is the client
    if (submission.contracts.client_id !== user.id) {
      throw new Error("Unauthorized");
    }

    // Update submission
    const newStatus = approved ? 'approved' : 'rejected';
    const { error: updateError } = await supabaseClient
      .from('work_submissions')
      .update({
        status: newStatus,
        reviewed_by: user.id,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (updateError) throw updateError;

    if (approved) {
      // Update contract
      await supabaseClient
        .from('contracts')
        .update({
          work_approved_at: new Date().toISOString(),
          escrow_status: 'ready_for_release',
        })
        .eq('id', submission.contract_id);

      // Notify professional
      await supabaseClient
        .from('activity_feed')
        .insert({
          user_id: submission.contracts.tasker_id,
          event_type: 'work_approved',
          entity_type: 'contract',
          entity_id: submission.contract_id,
          title: 'Work Approved! Payment Processing',
          description: 'The client approved your work. Payment will be released shortly.',
          action_url: `/contract/${submission.contract_id}`,
          notification_type: 'payment',
          priority: 'high',
        });
    } else {
      // Notify professional of rejection
      await supabaseClient
        .from('activity_feed')
        .insert({
          user_id: submission.contracts.tasker_id,
          event_type: 'work_rejected',
          entity_type: 'contract',
          entity_id: submission.contract_id,
          title: 'Work Needs Revision',
          description: reviewNotes || 'The client requested changes to the work.',
          action_url: `/contract/${submission.contract_id}`,
          notification_type: 'contract',
          priority: 'high',
        });
    }

    return new Response(JSON.stringify({ success: true, approved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error approving work:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
