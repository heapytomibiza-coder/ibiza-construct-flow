import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

const moderateSchema = z.object({
  profile_id: z.string().uuid(),
  action: z.enum(["approve", "reject", "under_review"]),
  notes: z.string().max(1000).optional(),
  reason: z.string().max(500).optional(),
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

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2) Rate limiting - ADMIN_STANDARD (30/hr for moderation)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rateLimit = await checkRateLimitDb(serviceClient, user.id, 'admin-profile-moderate', 'API_STRICT');
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfter);
    }

    // 3) Verify admin role via admin_roles table (consistent pattern)
    const { data: adminRole, error: roleError } = await serviceClient
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError) {
      logError('admin-profile-moderate', roleError as Error, { userId: user.id });
      return new Response(
        JSON.stringify({ error: "Error checking admin privileges" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // admin, super_admin, or moderator can moderate profiles
    if (!adminRole || !['admin', 'super_admin', 'moderator'].includes(adminRole.role)) {
      await logSecurityEvent(serviceClient, 'unauthorized_admin_access', 'high', user.id, {
        endpoint: 'admin-profile-moderate',
        action: 'profile_moderation',
        attemptedRole: adminRole?.role ?? 'none'
      });
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4) Validate request body
    const { profile_id, action, notes, reason } = await validateRequestBody(req, moderateSchema);

    // 5) Update profile verification status
    const updates: Record<string, unknown> = {
      verification_status: action,
      verification_notes: notes ?? reason ?? null,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    };

    const { data, error } = await serviceClient
      .from("profiles")
      .update(updates)
      .eq("id", profile_id)
      .select()
      .single();

    if (error) {
      logError('admin-profile-moderate', error as Error, { profile_id, action });
      throw error;
    }

    // 6) Audit log
    await serviceClient.rpc("log_admin_action", {
      p_action: `PROFILE_${action.toUpperCase()}`,
      p_entity_type: "profile",
      p_entity_id: profile_id,
      p_meta: { notes, reason },
    });

    // 7) Security event log
    await logSecurityEvent(serviceClient, 'admin_profile_moderated', 'low', user.id, {
      profile_id,
      action,
      adminRole: adminRole.role
    });

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logError('admin-profile-moderate', error as Error);
    return createErrorResponse(error as Error);
  }
});
