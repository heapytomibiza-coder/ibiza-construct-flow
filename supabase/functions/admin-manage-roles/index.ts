import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1) Create user client from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // 2) Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", user.id);

    // 3) Verify user is admin
    const { data: roleData, error: roleError } = await supabase
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
      console.error("User is not admin");
      return new Response(
        JSON.stringify({ error: "Forbidden: admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4) Parse request body
    const { action, targetUserId, role } = await req.json();

    if (!action || !targetUserId || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: action, targetUserId, role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5) Call appropriate RPC function
    if (action === "assign") {
      const { error: rpcError } = await supabase.rpc("admin_assign_role", {
        p_target_user_id: targetUserId,
        p_role: role,
      });

      if (rpcError) {
        console.error("Error assigning role:", rpcError);
        return new Response(
          JSON.stringify({ error: `Failed to assign role: ${rpcError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Role ${role} assigned to user ${targetUserId}`,
          auditTrail: { action: "assign", role, targetUserId, performedBy: user.id },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (action === "revoke") {
      const { error: rpcError } = await supabase.rpc("admin_revoke_role", {
        p_target_user_id: targetUserId,
        p_role: role,
      });

      if (rpcError) {
        console.error("Error revoking role:", rpcError);
        return new Response(
          JSON.stringify({ error: `Failed to revoke role: ${rpcError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Role ${role} revoked from user ${targetUserId}`,
          auditTrail: { action: "revoke", role, targetUserId, performedBy: user.id },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: `Invalid action: ${action}. Use 'assign' or 'revoke'` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error in admin-manage-roles:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
