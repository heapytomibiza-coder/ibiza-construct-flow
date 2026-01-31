import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { 
  checkRateLimitDb, 
  createRateLimitResponse, 
  corsHeaders, 
  handleCors, 
  logSecurityEvent 
} from '../_shared/securityMiddleware.ts';

// Strict validation schemas
const Option = z.object({ 
  value: z.string().max(100), 
  label: z.string().max(200) 
});

const Question = z.object({
  code: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/),
  label: z.string().min(2).max(500),
  help_text: z.string().max(1000).optional(),
  type: z.enum([
    "short_text", "long_text", "number", "boolean",
    "single_select", "multi_select", "date", "file",
  ]),
  required: z.boolean().optional(),
  options: z.array(Option).max(50).optional(),
  validation: z.record(z.string().max(50), z.any()).optional(),
  sort_index: z.number().int().nonnegative().max(1000).default(0),
});

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.string().min(1).max(100),
  subcategory: z.string().min(1).max(100),
  micro: z.string().min(1).max(100),
  questions_micro: z.array(Question).max(100).default([]),
  questions_logistics: z.array(Question).max(50).default([]),
  is_active: z.boolean().default(true),
  sort_index: z.number().int().max(10000).default(0),
  change_summary: z.string().max(500).optional(),
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

    // 2) Rate limiting - ADMIN_STANDARD (30/hr for content management)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rateLimit = await checkRateLimitDb(serviceClient, user.id, 'admin-service-upsert', 'API_STRICT');
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
      logError('admin-service-upsert', roleError as Error, { userId: user.id });
      return new Response(
        JSON.stringify({ error: "Error checking admin privileges" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only admin or super_admin can manage services (not moderators)
    if (!adminRole || !['admin', 'super_admin'].includes(adminRole.role)) {
      await logSecurityEvent(serviceClient, 'unauthorized_admin_access', 'high', user.id, {
        endpoint: 'admin-service-upsert',
        action: 'service_management',
        attemptedRole: adminRole?.role ?? 'none'
      });
      return new Response(
        JSON.stringify({ error: "Admin access required for service management" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4) Validate request body
    const parsed = await validateRequestBody(req, upsertSchema);

    // 5) Create snapshot if updating existing service
    if (parsed.id) {
      const { data: existing } = await serviceClient
        .from("services_micro")
        .select("*")
        .eq("id", parsed.id)
        .maybeSingle();

      if (existing) {
        await serviceClient.from("services_micro_versions").insert({
          services_micro_id: parsed.id,
          snapshot: existing,
          change_summary: parsed.change_summary ?? "Updated via admin",
          actor: user.id,
        });
      }
    }

    // 6) Upsert service
    const { data, error } = await serviceClient
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
      logError('admin-service-upsert', error as Error, { parsed });
      throw error;
    }

    // 7) Audit log
    await serviceClient.rpc("log_admin_action", {
      p_action: parsed.id ? "SERVICES_MICRO_UPDATE" : "SERVICES_MICRO_CREATE",
      p_entity_type: "services_micro",
      p_entity_id: data.id,
      p_meta: { 
        category: data.category, 
        subcategory: data.subcategory, 
        micro: data.micro 
      },
    });

    // 8) Security event log
    await logSecurityEvent(serviceClient, 'admin_service_upserted', 'low', user.id, {
      serviceId: data.id,
      isCreate: !parsed.id,
      adminRole: adminRole.role
    });

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logError('admin-service-upsert', error as Error);
    return createErrorResponse(error as Error);
  }
});
