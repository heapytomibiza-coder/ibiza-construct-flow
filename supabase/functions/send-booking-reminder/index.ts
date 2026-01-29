import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date().toISOString();

    console.log("Checking for due booking reminders...");

    const { data: due, error } = await supabase
      .from("booking_reminders")
      .select("id, user_id, reminder_type, booking_id")
      .lte("scheduled_for", now)
      .eq("status", "pending")
      .limit(100);

    if (error) {
      console.error("Error fetching reminders:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Found ${due?.length || 0} reminders to send`);

    for (const reminder of due ?? []) {
      if (RESEND_API_KEY) {
        const { data: { user } } = await supabase.auth.admin.getUserById(reminder.user_id);
        const email = user?.email;
        
        if (email) {
          console.log(`Sending reminder to ${email} (${reminder.reminder_type})`);
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: "Ibiza Construct <reminders@ibiza.app>",
              to: email,
              subject: `Booking reminder (${reminder.reminder_type})`,
              html: `<p>You have an upcoming booking. <a href="${req.headers.get("origin")}/booking/${reminder.booking_id}">View details</a></p>`,
            }),
          }).catch((err) => {
            console.error(`Email error for reminder ${reminder.id}:`, err);
          });
        }
      }

      // Mark as sent
      await supabase
        .from("booking_reminders")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", reminder.id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sent: due?.length || 0 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in send-booking-reminder:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
