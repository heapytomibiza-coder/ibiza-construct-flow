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

    let remindersSent = 0;

    // Query for completed contracts from the last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: contracts, error: contractsError } = await supabaseClient
      .from('contracts')
      .select(`
        id,
        client_id,
        tasker_id,
        job_id,
        updated_at,
        status,
        jobs!inner(title)
      `)
      .eq('status', 'completed')
      .gte('updated_at', fourteenDaysAgo)
      .lte('updated_at', oneDayAgo)
      .not('status', 'in', '(dispute,refunded)');

    if (contractsError) throw contractsError;

    for (const contract of contracts || []) {
      const { client_id, tasker_id, id: contract_id, updated_at } = contract;
      const jobTitle = (contract.jobs as any)?.title || 'this project';

      // Check both parties
      const parties = [
        { user_id: client_id, role: 'client' },
        { user_id: tasker_id, role: 'professional' }
      ];

      for (const party of parties) {
        if (!party.user_id) continue;

        // Check if user has dismissed reminders for this contract
        const { data: dismissal } = await supabaseClient
          .from('review_reminder_dismissals')
          .select('*')
          .eq('contract_id', contract_id)
          .eq('user_id', party.user_id)
          .single();

        if (dismissal) {
          if (dismissal.reason === 'not_interested' || dismissal.reason === 'already_reviewed') {
            continue;
          }
          if (dismissal.snooze_until && new Date(dismissal.snooze_until) > new Date()) {
            continue;
          }
        }

        // Check for existing review
        const { data: existingReview } = await supabaseClient
          .from('reviews')
          .select('id')
          .eq('contract_id', contract_id)
          .eq('reviewer_id', party.user_id)
          .single();

        if (existingReview) continue;

        // Check user's notification preferences
        const { data: prefs } = await supabaseClient
          .from('notification_preferences')
          .select('review_reminders_enabled, review_reminders_frequency')
          .eq('user_id', party.user_id)
          .eq('notification_type', 'all')
          .single();

        if (prefs?.review_reminders_enabled === false || prefs?.review_reminders_frequency === 'off') {
          continue;
        }

        // Check existing reminder count
        const { data: existingReminders } = await supabaseClient
          .from('activity_feed')
          .select('reminder_count')
          .eq('user_id', party.user_id)
          .eq('notification_type', 'review_reminder')
          .eq('metadata->>contract_id', contract_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const reminderCount = existingReminders?.reminder_count || 0;
        
        // Max 3 reminders per contract
        if (reminderCount >= 3) continue;

        // Determine timing
        const daysSinceCompletion = Math.floor((Date.now() - new Date(updated_at).getTime()) / (24 * 60 * 60 * 1000));
        
        // Send at 1, 7, and 14 days
        const shouldSendReminder = 
          (daysSinceCompletion >= 1 && reminderCount === 0) ||
          (daysSinceCompletion >= 7 && reminderCount === 1) ||
          (daysSinceCompletion >= 14 && reminderCount === 2);

        if (!shouldSendReminder) continue;

        // Reduced frequency: only 7 and 14 days
        if (prefs?.review_reminders_frequency === 'reduced' && daysSinceCompletion < 7) {
          continue;
        }

        // Count pending reminders for throttling
        const { data: pendingReminders } = await supabaseClient
          .from('activity_feed')
          .select('id', { count: 'exact' })
          .eq('user_id', party.user_id)
          .eq('notification_type', 'review_reminder')
          .is('read_at', null);

        // If >5 pending, skip (batch into digest)
        if (pendingReminders && pendingReminders.length > 5) {
          continue;
        }

        // Send reminder
        await supabaseClient.from('activity_feed').insert({
          user_id: party.user_id,
          event_type: 'review_reminder',
          entity_type: 'contract',
          entity_id: contract_id,
          title: party.role === 'client' ? 'Review Your Professional' : 'Review Your Client',
          description: party.role === 'client' 
            ? `How was your experience with "${jobTitle}"? Your feedback helps others.`
            : `Share your experience working with your client on "${jobTitle}".`,
          action_url: `/contracts/${contract_id}/review`,
          priority: 'normal',
          notification_type: 'review_reminder',
          reminder_count: reminderCount + 1,
          metadata: { 
            contract_id, 
            reminder_type: party.role,
            reminder_number: reminderCount + 1,
            days_since_completion: daysSinceCompletion
          }
        });
        
        remindersSent++;
      }
    }

    console.log(`Sent ${remindersSent} review reminders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        remindersSent
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