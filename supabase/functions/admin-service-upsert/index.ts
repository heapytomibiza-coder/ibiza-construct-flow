import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schemas
const Option = z.object({ 
  value: z.string(), 
  label: z.string() 
});

const Question = z.object({
  code: z.string().min(2).regex(/^[a-z0-9_]+$/),
  label: z.string().min(2),
  help_text: z.string().optional(),
  type: z.enum([
    "short_text", "long_text", "number", "boolean",
    "single_select", "multi_select", "date", "file",
  ]),
  required: z.boolean().optional(),
  options: z.array(Option).optional(),
  validation: z.record(z.string(), z.any()).optional(),
  sort_index: z.number().int().nonnegative().default(0),
});

const Payload = z.object({
  id: z.string().uuid().optional(),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  micro: z.string().min(1),
  questions_micro: z.array(Question).default([]),
  questions_logistics: z.array(Question).default([]),
  is_active: z.boolean().default(true),
  sort_index: z.number().int().default(0),
  change_summary: z.string().optional(),
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("admin-service-upsert: Request received");

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
    const { data: roleData } = await userClient
      .from("user_roles")
      .select("app_role")
      .eq("user_id", user.id)
      .in("app_role", ["admin"])
      .maybeSingle();

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
    const body = await req.json();
    const parsed = Payload.parse(body);

    console.log("Payload validated:", parsed.id ? `Updating ${parsed.id}` : "Creating new");

    // 4) Create snapshot if updating existing service
    if (parsed.id) {
      const { data: existing } = await adminClient
        .from("services_micro")
        .select("*")
        .eq("id", parsed.id)
        .maybeSingle();

      if (existing) {
        console.log("Creating version snapshot for service:", parsed.id);
        await adminClient.from("services_micro_versions").insert({
          services_micro_id: parsed.id,
          snapshot: existing,
          change_summary: parsed.change_summary ?? "Updated via admin",
          actor: user.id,
        });
      }
    }

    // 5) Upsert service
    const { data, error } = await adminClient
      .from("services_micro")
      .upsert({
        id: parsed.id,
        category: parsed.category,
        subcategory: parsed.subcategory,
        micro: parsed.micro,
        questions_micro: parsed.questions_micro,
        questions_logistics: parsed.questions_logistics,
        is_active: parsed.is_active,
        sort_index: parsed.sort_index,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Database upsert error:", error);
      throw error;
    }

    console.log("Service upserted successfully:", data.id);

    // 6) Create audit log entry
    await adminClient.rpc("log_admin_action", {
      p_action: parsed.id ? "SERVICES_MICRO_UPDATE" : "SERVICES_MICRO_CREATE",
      p_entity_type: "services_micro",
      p_entity_id: data.id,
      p_meta: { 
        category: data.category, 
        subcategory: data.subcategory, 
        micro: data.micro 
      },
    });

    console.log("Audit log created");

    return new Response(
      JSON.stringify({ success: true, data }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("Error in admin-service-upsert:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
