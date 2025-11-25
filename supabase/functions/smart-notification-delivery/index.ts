import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { getErrorMessage } from '../_shared/errorUtils.ts';

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const {
      user_id,
      title,
      description,
      event_type,
      priority = 'normal',
      category = 'general',
      action_url,
      metadata = {}
    } = await req.json();

    if (!user_id || !title) {
      throw new Error('user_id and title are required');
    }

    // Get user's notification preferences
    const { data: preferences } = await supabaseClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .eq('notification_type', 'all')
      .single();

    // Check granular review preferences
    let shouldDeliver = preferences?.enabled !== false;
    
    if (event_type === 'review_received') {
      shouldDeliver = preferences?.review_received_enabled !== false;
    } else if (event_type === 'review_response') {
      shouldDeliver = preferences?.review_response_enabled !== false;
    } else if (event_type === 'review_helpful_vote') {
      shouldDeliver = preferences?.review_helpful_enabled !== false;
    } else if (event_type === 'review_reminder') {
      shouldDeliver = preferences?.review_reminders_enabled !== false;
    }

    if (!shouldDeliver) {
      return new Response(
        JSON.stringify({ success: true, delivered: false, reason: 'User preferences' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate notifications in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentNotifications } = await supabaseClient
      .from('activity_feed')
      .select('id')
      .eq('user_id', user_id)
      .eq('title', title)
      .gte('created_at', fiveMinutesAgo);

    if (recentNotifications && recentNotifications.length > 0) {
      return new Response(
        JSON.stringify({ success: true, delivered: false, reason: 'Duplicate prevention' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification
    const { data: notification, error: insertError } = await supabaseClient
      .from('activity_feed')
      .insert({
        user_id,
        title,
        description,
        event_type,
        priority,
        notification_type: category,
        action_url,
        metadata
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Handle email notifications based on preferences
    if (preferences?.email_enabled && priority === 'high') {
      // Queue email notification (implement separately with email service)
      console.log('Would send email notification for:', notification.id);
    }

    // Handle digest notifications
    if (preferences?.digest_enabled) {
      // Mark for inclusion in daily digest
      await supabaseClient
        .from('notification_digest_queue')
        .insert({
          user_id,
          notification_id: notification.id,
          scheduled_for: new Date(new Date().setHours(18, 0, 0, 0)).toISOString()
        });
    }

    return new Response(
      JSON.stringify({ success: true, delivered: true, notification }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
