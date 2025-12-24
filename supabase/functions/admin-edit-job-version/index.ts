import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { checkRateLimitDb, createRateLimitResponse, createServiceClient, corsHeaders, handleCors, logSecurityEvent } from '../_shared/securityMiddleware.ts';

const requestSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  newData: z.record(z.string(), z.any()),
  changeReason: z.string().trim().min(1).max(500),
  changedBy: z.string().uuid('Invalid user ID'),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();

    // Rate limiting - API_STRICT for admin operations (30/hr)
    const authHeader = req.headers.get('Authorization');
    let userId: string | undefined;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData } = await supabase.auth.getUser(token);
      userId = userData.user?.id;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rateLimit = await checkRateLimitDb(supabase, userId, 'admin-edit-job-version', 'API_STRICT');
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfter);
    }

    // Verify admin role
    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (!adminRole || !['admin', 'super_admin', 'moderator'].includes(adminRole.role)) {
      await logSecurityEvent(supabase, 'unauthorized_admin_access', 'high', userId, {
        endpoint: 'admin-edit-job-version',
        action: 'job_edit'
      });
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { jobId, newData, changeReason, changedBy } = await validateRequestBody(req, requestSchema);

    // Create version snapshot before updating
    const { data: versionId, error: versionError } = await supabase.rpc(
      'create_job_version',
      {
        p_job_id: jobId,
        p_changed_by: changedBy,
        p_change_reason: changeReason,
        p_new_data: newData
      }
    );

    if (versionError) {
      console.error('Version creation error:', versionError);
      throw versionError;
    }

    // Update the job
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update({
        ...newData,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();

    if (updateError) {
      console.error('Job update error:', updateError);
      throw updateError;
    }

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_action: 'job_edit',
      p_entity_type: 'job',
      p_entity_id: jobId,
      p_changes: {
        version_id: versionId,
        reason: changeReason,
        fields_changed: Object.keys(newData)
      }
    });

    await logSecurityEvent(supabase, 'admin_job_edit', 'low', userId, {
      jobId,
      versionId,
      fieldsChanged: Object.keys(newData)
    });

    console.log('Job updated successfully:', { jobId, versionId });

    return new Response(
      JSON.stringify({ 
        success: true, 
        job: updatedJob,
        versionId 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    logError('admin-edit-job-version', error as Error);
    return createErrorResponse(error as Error);
  }
});
