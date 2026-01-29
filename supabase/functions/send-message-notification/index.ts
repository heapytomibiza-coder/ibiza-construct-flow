import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";
import { getErrorMessage } from '../_shared/errorUtils.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const PUSH_WEBHOOK_URL = Deno.env.get("PUSH_WEBHOOK_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload?.record;
    if (!record) {
      return new Response("No record", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { conversation_id, recipient_id, content, sender_id } = record;

    // Look up recipient devices
    const { data: devices } = await supabase
      .from("user_devices")
      .select("endpoint, p256dh, auth")
      .eq("user_id", recipient_id);

    console.log(`Message notification for user ${recipient_id}: ${devices?.length || 0} devices`);

    // Push relay (optional): forward to your push service
    if (devices && devices.length && PUSH_WEBHOOK_URL) {
      await fetch(PUSH_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          recipient_id, 
          devices, 
          type: "message", 
          conversation_id,
          preview: content?.slice(0, 100)
        }),
      }).catch((err) => {
        console.error("Push relay error:", err);
      });
    }

    // Email fallback if no devices registered (optional)
    if ((!devices || !devices.length) && RESEND_API_KEY) {
      const { data: { user } } = await supabase.auth.admin.getUserById(recipient_id);
      const email = user?.email;
      
      if (email) {
        console.log(`Sending email fallback to ${email}`);
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Ibiza Construct <notifications@ibiza.app>",
            to: email,
            subject: "New message waiting",
            html: `<p>You have a new message: "${escapeHtml(content?.slice(0, 120) ?? "")}"</p>`,
          }),
        }).catch((err) => {
          console.error("Email send error:", err);
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in send-message-notification:", error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[ch];
  });
}
