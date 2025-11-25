import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  userId: string;
  notificationId: string;
  title: string;
  body: string;
  category: string;
  url?: string;
  priority?: 'normal' | 'high' | 'urgent';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { userId, notificationId, title, body, category, url, priority = 'normal' } = payload;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Smart routing notification ${notificationId} for user ${userId}`);

    // Get user preferences
    const { data: prefs } = await supabaseClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const smartRoutingEnabled = prefs?.smart_routing_enabled ?? true;
    const escalationDelay = (prefs?.escalation_delay_minutes ?? 120) * 60 * 1000; // Convert to ms

    // Always create in-app notification first
    // (This is already done by the caller, so we just track it)

    // Determine channels based on priority and preferences
    const channels: string[] = [];

    if (priority === 'urgent') {
      // Urgent: try all enabled channels immediately
      if (prefs?.push_enabled) channels.push('push');
      if (prefs?.email_digest_enabled) channels.push('email');
      if (prefs?.sms_enabled) channels.push('sms');
    } else if (priority === 'high') {
      // High: Push first, then email
      if (prefs?.push_enabled) channels.push('push');
      else if (prefs?.email_digest_enabled) channels.push('email');
    } else {
      // Normal: Push only (if enabled)
      if (prefs?.push_enabled) channels.push('push');
    }

    const results: any[] = [];

    // Send through each channel
    for (const channel of channels) {
      try {
        if (channel === 'push') {
          const { data: pushResult } = await supabaseClient.functions.invoke(
            'send-push-notification',
            {
              body: {
                userId,
                notificationId,
                title,
                body,
                url,
                priority,
              },
            }
          );
          results.push({ channel: 'push', ...pushResult });
        } else if (channel === 'email') {
          // Email would be sent through another edge function
          // For now, just log it
          console.log(`Would send email to user ${userId}: ${title}`);
          results.push({ channel: 'email', skipped: true, reason: 'Not implemented yet' });
        } else if (channel === 'sms') {
          const { data: smsResult } = await supabaseClient.functions.invoke(
            'send-sms-notification',
            {
              body: {
                userId,
                notificationId,
                message: `${title}: ${body}`,
                isUrgent: priority === 'urgent',
              },
            }
          );
          results.push({ channel: 'sms', ...smsResult });
        }
      } catch (error) {
        console.error(`Failed to send via ${channel}:`, error);
        results.push({
          channel,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Schedule escalation if smart routing is enabled and priority allows
    if (smartRoutingEnabled && priority !== 'urgent' && channels.length > 0) {
      // Check if push was sent
      const pushSent = results.some(r => r.channel === 'push' && r.success);
      
      if (pushSent) {
        // Schedule escalation check
        console.log(`Scheduling escalation check in ${escalationDelay}ms for notification ${notificationId}`);
        
        // In a real implementation, this would use a job queue or scheduled function
        // For now, we'll insert a record that a scheduled job can pick up
        await supabaseClient.from('notification_deliveries').insert({
          notification_id: notificationId,
          user_id: userId,
          channel: 'email',
          status: 'pending',
          sent_at: new Date(Date.now() + escalationDelay).toISOString(),
          is_escalated: true,
          escalated_from: 'push',
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notificationId,
        channels: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
