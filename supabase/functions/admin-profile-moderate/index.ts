import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { mapError } from '../_shared/errorMapping.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const Payload = z.object({
  profile_id: z.string().uuid(),
  action: z.enum(["approve", "reject", "under_review"]),
  notes: z.string().max(1000).optional(),
  reason: z.string().max(500).optional(),
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("admin-profile-moderate: Request received");

    // Create user client for authentication
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { 
        global: { 
          headers: { Authorization: req.headers.get("Authorization")! } 
        } 
      }
    );

    // 1) Verify user authentication
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      console.error("Authentication failed:", userErr);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", user.id);

    // 2) Verify admin role
    const { data: roleData, error: roleError } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    
    if (roleError) {
      console.error("Role check error:", roleError);
      return new Response(
        JSON.stringify({ error: "Error checking admin privileges" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!roleData) {
      console.error("User does not have admin role");
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }), 
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin role verified");

    // Create service role client for privileged operations
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3) Parse and validate payload
    const parsed = await validateRequestBody(req, Payload);

    console.log("Moderating profile:", parsed.profile_id, "Action:", parsed.action);

    // 4) Update profile verification status
    const updates: Record<string, unknown> = {
      verification_status: parsed.action,
      verification_notes: parsed.notes ?? parsed.reason ?? null,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    };

    const { data, error } = await adminClient
      .from("profiles")
      .update(updates)
      .eq("id", parsed.profile_id)
      .select()
      .single();

    if (error) {
      console.error("Database update error:", error);
      throw error;
    }

    console.log("Profile status updated successfully");

    // 5) Create audit log entry
    await adminClient.rpc("log_admin_action", {
      p_action: `PROFILE_${parsed.action.toUpperCase()}`,
      p_entity_type: "profile",
      p_entity_id: parsed.profile_id,
      p_meta: { 
        notes: parsed.notes, 
        reason: parsed.reason 
      },
    });

    console.log("Audit log created");

    return new Response(
      JSON.stringify({ success: true, data }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("Error in admin-profile-moderate:", e);
    return new Response(
      JSON.stringify({ error: mapError(e) }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
