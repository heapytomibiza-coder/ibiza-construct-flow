import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { user_id, endpoint, keys, user_agent } = await req.json();

    if (!user_id || !endpoint || !keys?.p256dh || !keys?.auth) {
      return new Response(JSON.stringify({ error: "Bad request: missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Registering push device for user ${user_id}`);

    const { error } = await supabase
      .from("user_devices")
      .upsert({
        user_id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: user_agent || null,
        last_seen_at: new Date().toISOString(),
      }, { 
        onConflict: "user_id,endpoint",
        ignoreDuplicates: false 
      });

    if (error) {
      console.error("Error registering device:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in register-push-device:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
