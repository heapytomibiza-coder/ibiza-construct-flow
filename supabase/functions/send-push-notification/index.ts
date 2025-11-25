import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  userId: string;
  notificationId: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
  priority?: 'normal' | 'high';
  actions?: Array<{ action: string; title: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: PushPayload = await req.json();
    const { userId, notificationId, title, body, icon, url, priority, actions } = payload;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user should receive push notification
    const { data: shouldSend } = await supabaseClient.rpc('should_send_notification', {
      p_user_id: userId,
      p_notification_id: notificationId,
      p_channel: 'push',
      p_category: 'system', // Could be dynamic based on notification type
    });

    if (!shouldSend) {
      console.log(`Push notification skipped for user ${userId} (preferences/rules)`);
      
      // Log as skipped
      await supabaseClient.from('notification_deliveries').insert({
        notification_id: notificationId,
        user_id: userId,
        channel: 'push',
        status: 'skipped',
      });

      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'User preferences' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's push subscriptions
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (subsError) throw subsError;

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      
      await supabaseClient.from('notification_deliveries').insert({
        notification_id: notificationId,
        user_id: userId,
        channel: 'push',
        status: 'failed',
        error_message: 'No push subscriptions found',
      });

      return new Response(
        JSON.stringify({ success: false, error: 'No push subscriptions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    // Send push to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          // Use web-push library to send notification
          const response = await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'TTL': '86400', // 24 hours
            },
            body: JSON.stringify({
              title,
              body,
              icon: icon || '/icon-192.png',
              badge: '/badge-72.png',
              tag: notificationId,
              data: {
                notificationId,
                url: url || '/',
              },
              actions: actions || [],
              priority,
            }),
          });

          if (!response.ok) {
            throw new Error(`Push failed: ${response.status} ${response.statusText}`);
          }

          // Update subscription last_used_at
          await supabaseClient
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', subscription.id);

          return { success: true, subscriptionId: subscription.id };
        } catch (error) {
          console.error(`Failed to send push to subscription ${subscription.id}:`, error);
          
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          
          // Deactivate invalid subscriptions (410 Gone or 404 Not Found)
          if (errorMsg.includes('410') || errorMsg.includes('404')) {
            await supabaseClient
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', subscription.id);
          }

          return { success: false, subscriptionId: subscription.id, error: errorMsg };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedCount = results.length - successCount;

    // Log delivery
    await supabaseClient.from('notification_deliveries').insert({
      notification_id: notificationId,
      user_id: userId,
      channel: 'push',
      status: successCount > 0 ? 'sent' : 'failed',
      sent_at: new Date().toISOString(),
      provider_response: { results, successCount, failedCount },
    });

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failedCount,
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
