import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch pending notifications from queue
    const { data: pendingNotifications, error: fetchError } = await supabaseClient
      .from("notifications_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .lt("attempts", 3)
      .limit(50);

    if (fetchError) throw fetchError;

    if (!pendingNotifications || pendingNotifications.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending notifications", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = await Promise.allSettled(
      pendingNotifications.map(async (notification) => {
        try {
          // Update status to processing
          await supabaseClient
            .from("notifications_queue")
            .update({
              status: "processing",
              attempts: notification.attempts + 1,
              last_attempt_at: new Date().toISOString(),
            })
            .eq("id", notification.id);

          // Process each channel
          const channelResults = await Promise.allSettled(
            notification.channels.map((channel: string) =>
              processChannel(supabaseClient, notification, channel)
            )
          );

          // Check if all channels succeeded
          const allSucceeded = channelResults.every(
            (result) => result.status === "fulfilled"
          );

          // Update queue status
          await supabaseClient
            .from("notifications_queue")
            .update({
              status: allSucceeded ? "sent" : "failed",
              error_message: allSucceeded
                ? null
                : "Some channels failed to send",
            })
            .eq("id", notification.id);

          return { id: notification.id, success: allSucceeded };
        } catch (error) {
          console.error(
            `Error processing notification ${notification.id}:`,
            error
          );
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          // Update as failed
          await supabaseClient
            .from("notifications_queue")
            .update({
              status: "failed",
              error_message: errorMessage,
            })
            .eq("id", notification.id);

          return { id: notification.id, success: false, error: errorMessage };
        }
      })
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    return new Response(
      JSON.stringify({
        message: "Notifications processed",
        total: pendingNotifications.length,
        successful: successCount,
        failed: pendingNotifications.length - successCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in process-notifications:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function processChannel(
  supabaseClient: any,
  notification: any,
  channel: string
) {
  try {
    switch (channel) {
      case "in_app":
        return await sendInAppNotification(supabaseClient, notification);
      case "email":
        return await sendEmailNotification(supabaseClient, notification);
      case "push":
        return await sendPushNotification(supabaseClient, notification);
      case "sms":
        return await sendSmsNotification(supabaseClient, notification);
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    // Log delivery failure
    await supabaseClient.from("notification_deliveries").insert({
      queue_id: notification.id,
      user_id: notification.user_id,
      channel,
      status: "failed",
      failed_reason: errorMessage,
    });
    throw error;
  }
}

async function sendInAppNotification(supabaseClient: any, notification: any) {
  const { error } = await supabaseClient.from("in_app_notifications").insert({
    user_id: notification.user_id,
    notification_type: notification.notification_type,
    title: notification.subject || "Notification",
    message: notification.body,
    data: notification.data,
    priority: notification.priority,
    action_url: notification.data.action_url,
    action_label: notification.data.action_label,
  });

  if (error) throw error;

  // Log successful delivery
  await supabaseClient.from("notification_deliveries").insert({
    queue_id: notification.id,
    user_id: notification.user_id,
    channel: "in_app",
    status: "sent",
    delivered_at: new Date().toISOString(),
  });

  return { success: true };
}

async function sendEmailNotification(supabaseClient: any, notification: any) {
  // This would call your email service (Resend, SendGrid, etc.)
  // For now, we'll just log it
  console.log("Would send email to user:", notification.user_id);
  
  await supabaseClient.from("notification_deliveries").insert({
    queue_id: notification.id,
    user_id: notification.user_id,
    channel: "email",
    status: "sent",
    delivered_at: new Date().toISOString(),
  });

  return { success: true };
}

async function sendPushNotification(supabaseClient: any, notification: any) {
  // Get user's push subscriptions
  const { data: subscriptions } = await supabaseClient
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", notification.user_id)
    .eq("is_active", true);

  if (!subscriptions || subscriptions.length === 0) {
    throw new Error("No active push subscriptions found");
  }

  // Would send web push notifications here
  console.log("Would send push to", subscriptions.length, "devices");

  await supabaseClient.from("notification_deliveries").insert({
    queue_id: notification.id,
    user_id: notification.user_id,
    channel: "push",
    status: "sent",
    delivered_at: new Date().toISOString(),
  });

  return { success: true };
}

async function sendSmsNotification(supabaseClient: any, notification: any) {
  // This would call your SMS service (Twilio, etc.)
  console.log("Would send SMS to user:", notification.user_id);

  await supabaseClient.from("notification_deliveries").insert({
    queue_id: notification.id,
    user_id: notification.user_id,
    channel: "sms",
    status: "sent",
    delivered_at: new Date().toISOString(),
  });

  return { success: true };
}
