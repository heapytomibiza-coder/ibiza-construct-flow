import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError, mapError } from '../_shared/errorMapping.ts';
import { 
  checkRateLimitDb, 
  createRateLimitResponse, 
  corsHeaders, 
  handleCors, 
  logSecurityEvent 
} from '../_shared/securityMiddleware.ts';

const verifySchema = z.object({
  verificationId: z.string().uuid(),
  approved: z.boolean(),
  notes: z.string().max(1000).optional(),
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

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2) Rate limiting - ADMIN_STANDARD (30/hr for verifications)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rateLimit = await checkRateLimitDb(serviceClient, user.id, 'admin-verify', 'API_STRICT');
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
      logError('admin-verify', roleError as Error, { userId: user.id });
      return new Response(
        JSON.stringify({ error: "Error checking admin privileges" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // admin, super_admin, or moderator can verify profiles
    if (!adminRole || !['admin', 'super_admin', 'moderator'].includes(adminRole.role)) {
      await logSecurityEvent(serviceClient, 'unauthorized_admin_access', 'high', user.id, {
        endpoint: 'admin-verify',
        action: 'professional_verification',
        attemptedRole: adminRole?.role ?? 'none'
      });
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4) Validate request body
    const { verificationId, approved, notes } = await validateRequestBody(req, verifySchema);

    // 5) Get verification details
    const { data: verification, error: verificationError } = await serviceClient
      .from("professional_verifications")
      .select("professional_id")
      .eq("id", verificationId)
      .single();

    if (verificationError || !verification) {
      return new Response(
        JSON.stringify({ error: "Verification not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const professionalId = verification.professional_id;

    // 6) Get professional profile for notification
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", professionalId)
      .single();

    // 7) Update verification status
    const { error: updateError } = await serviceClient
      .from("professional_verifications")
      .update({
        status: approved ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        notes: notes || null,
      })
      .eq("id", verificationId);

    if (updateError) {
      logError('admin-verify', updateError as Error, { verificationId });
      return new Response(
        JSON.stringify({ error: "Failed to update verification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8) If approved, update professional_profiles
    if (approved) {
      await serviceClient
        .from("professional_profiles")
        .update({
          verified: true,
          kyc_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("user_id", professionalId);
    }

    // 9) Audit log
    await serviceClient
      .from("admin_audit_logs")
      .insert({
        admin_id: user.id,
        action: approved ? "verification_approved" : "verification_rejected",
        entity_type: "professional_verification",
        entity_id: verificationId,
        details: {
          professional_id: professionalId,
          professional_name: profile?.full_name,
          notes,
        },
      });

    // 10) Security event log
    await logSecurityEvent(serviceClient, 'admin_verification_processed', 'low', user.id, {
      verificationId,
      professionalId,
      approved,
      adminRole: adminRole.role
    });

    // 11) Send notification email (non-blocking)
    try {
      if (profile?.email) {
        await serviceClient.functions.invoke("send-email", {
          body: {
            type: approved ? "verification_approved" : "verification_rejected",
            data: {
              email: profile.email,
              name: profile.full_name,
              reason: notes,
            },
          },
        });
      }
    } catch (emailError) {
      // Don't fail the request if email fails
      logError('admin-verify', emailError as Error, { context: 'email_send' });
    }

    return new Response(
      JSON.stringify({
        success: true,
        verificationId,
        approved,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logError('admin-verify', error as Error);
    return createErrorResponse(error as Error);
  }
});
