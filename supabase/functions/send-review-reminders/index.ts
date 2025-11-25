import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find completed contracts from the last 7 days without reviews
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: completedContracts, error: contractsError } = await supabaseClient
      .from('contracts')
      .select(`
        id,
        client_id,
        tasker_id,
        job_id,
        jobs!inner(title)
      `)
      .eq('status', 'completed')
      .gte('updated_at', sevenDaysAgo.toISOString())
      .lte('updated_at', threeDaysAgo.toISOString());

    if (contractsError) throw contractsError;

    const reminders = [];

    for (const contract of completedContracts || []) {
      const jobTitle = (contract.jobs as any)?.title || 'this project';
      
      // Check if client has reviewed the professional
      const { data: clientReview } = await supabaseClient
        .from('reviews')
        .select('id')
        .eq('contract_id', contract.id)
        .eq('reviewer_id', contract.client_id)
        .eq('reviewee_id', contract.tasker_id)
        .single();

      if (!clientReview) {
        // Send reminder to client
        const { error: clientNotifError } = await supabaseClient
          .from('activity_feed')
          .insert({
            user_id: contract.client_id,
            event_type: 'review_reminder',
            entity_type: 'contract',
            entity_id: contract.id,
            title: 'Review Your Professional',
            description: `How was your experience with "${jobTitle}"? Your feedback helps others make informed decisions.`,
            action_url: `/contracts/${contract.id}/review`,
            priority: 'medium',
            notification_type: 'review',
          });

        if (!clientNotifError) {
          reminders.push({ type: 'client', contractId: contract.id, userId: contract.client_id });
        }
      }

      // Check if professional has reviewed the client
      const { data: professionalReview } = await supabaseClient
        .from('reviews')
        .select('id')
        .eq('contract_id', contract.id)
        .eq('reviewer_id', contract.tasker_id)
        .eq('reviewee_id', contract.client_id)
        .single();

      if (!professionalReview) {
        // Send reminder to professional
        const { error: proNotifError } = await supabaseClient
          .from('activity_feed')
          .insert({
            user_id: contract.tasker_id,
            event_type: 'review_reminder',
            entity_type: 'contract',
            entity_id: contract.id,
            title: 'Review Your Client',
            description: `Share your experience working with your client on "${jobTitle}".`,
            action_url: `/contracts/${contract.id}/review`,
            priority: 'medium',
            notification_type: 'review',
          });

        if (!proNotifError) {
          reminders.push({ type: 'professional', contractId: contract.id, userId: contract.tasker_id });
        }
      }
    }

    console.log(`Sent ${reminders.length} review reminders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        remindersSent: reminders.length,
        reminders 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
