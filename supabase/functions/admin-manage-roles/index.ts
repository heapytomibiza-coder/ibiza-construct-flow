import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { 
  checkRateLimitDb, 
  createRateLimitResponse, 
  corsHeaders, 
  handleCors, 
  logSecurityEvent 
} from '../_shared/securityMiddleware.ts';

const manageRolesSchema = z.object({
  action: z.enum(['assign', 'revoke']),
  targetUserId: z.string().uuid(),
  role: z.enum(['admin', 'professional', 'client', 'moderator']), // Strict role enum
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 1) Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2) Rate limiting - ADMIN_STRICT (5/hr for role management)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rateLimit = await checkRateLimitDb(serviceClient, user.id, 'admin-manage-roles', 'PAYMENT_STRICT');
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfter);
    }

    // 3) Verify admin role via admin_roles table (consistent with admin-edit-job-version)
    const { data: adminRole, error: roleError } = await serviceClient
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError) {
      logError('admin-manage-roles', roleError as Error, { userId: user.id });
      return new Response(
        JSON.stringify({ error: "Error checking admin privileges" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only super_admin can manage roles (highest privilege operation)
    if (!adminRole || adminRole.role !== 'super_admin') {
      await logSecurityEvent(serviceClient, 'unauthorized_admin_access', 'critical', user.id, {
        endpoint: 'admin-manage-roles',
        action: 'role_management',
        attemptedRole: adminRole?.role ?? 'none'
      });
      return new Response(
        JSON.stringify({ error: "Super admin access required for role management" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4) Validate request body
    const { action, targetUserId, role } = await validateRequestBody(req, manageRolesSchema);

    // 5) Prevent self-demotion/removal
    if (targetUserId === user.id && action === 'revoke') {
      return new Response(
        JSON.stringify({ error: "Cannot revoke your own role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6) Execute role action via RPC
    if (action === "assign") {
      const { error: rpcError } = await serviceClient.rpc("admin_assign_role", {
        p_target_user_id: targetUserId,
        p_role: role,
      });

      if (rpcError) {
        logError('admin-manage-roles', rpcError as Error, { action, targetUserId, role });
        return new Response(
          JSON.stringify({ error: "Failed to assign role" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log security event
      await logSecurityEvent(serviceClient, 'admin_role_assigned', 'medium', user.id, {
        targetUserId,
        role,
        action: 'assign'
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Role ${role} assigned successfully`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      const { error: rpcError } = await serviceClient.rpc("admin_revoke_role", {
        p_target_user_id: targetUserId,
        p_role: role,
      });

      if (rpcError) {
        logError('admin-manage-roles', rpcError as Error, { action, targetUserId, role });
        return new Response(
          JSON.stringify({ error: "Failed to revoke role" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log security event
      await logSecurityEvent(serviceClient, 'admin_role_revoked', 'medium', user.id, {
        targetUserId,
        role,
        action: 'revoke'
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Role ${role} revoked successfully`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    logError('admin-manage-roles', error as Error);
    return createErrorResponse(error as Error);
  }
});
