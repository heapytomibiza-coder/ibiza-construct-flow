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

    // Find all pending digest notifications
    const now = new Date().toISOString();
    
    const { data: queuedNotifications, error: queueError } = await supabaseClient
      .from('notification_digest_queue')
      .select(`
        *,
        activity_feed (
          id,
          title,
          description,
          priority,
          created_at,
          notification_type
        )
      `)
      .lte('scheduled_for', now)
      .is('sent_at', null)
      .limit(100);

    if (queueError) throw queueError;

    // Group notifications by user
    const userGroups = queuedNotifications.reduce((acc: any, item) => {
      if (!acc[item.user_id]) acc[item.user_id] = [];
      acc[item.user_id].push(item);
      return acc;
    }, {});

    const results = [];

    // Process each user's digest
    for (const [userId, notifications] of Object.entries(userGroups)) {
      const notificationsList = notifications as any[];
      
      // Get user profile for email
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (!profile?.email) {
        console.log(`No email found for user ${userId}`);
        continue;
      }

      // Group by priority and type
      const highPriority = notificationsList.filter(n => 
        n.activity_feed?.priority === 'high'
      );
      const byType = notificationsList.reduce((acc: any, n) => {
        const type = n.activity_feed?.notification_type || 'other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(n);
        return acc;
      }, {});

      // Create digest content
      const digestContent = {
        user_name: profile.full_name || 'User',
        total_notifications: notificationsList.length,
        high_priority_count: highPriority.length,
        notifications_by_type: byType,
        high_priority_notifications: highPriority.map(n => ({
          title: n.activity_feed?.title,
          description: n.activity_feed?.description,
          created_at: n.activity_feed?.created_at
        }))
      };

      console.log(`Sending digest to ${profile.email}:`, digestContent);

      // Here you would integrate with your email service
      // For now, we'll just mark as sent
      
      // Mark notifications as sent
      const notificationIds = notificationsList.map(n => n.id);
      await supabaseClient
        .from('notification_digest_queue')
        .update({ sent_at: new Date().toISOString() })
        .in('id', notificationIds);

      results.push({
        user_id: userId,
        email: profile.email,
        notifications_sent: notificationsList.length
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
