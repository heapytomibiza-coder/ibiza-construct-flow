import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { jobId, newData, changeReason, changedBy } = await req.json();

    if (!jobId || !newData || !changeReason || !changedBy) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

  } catch (error: any) {
    console.error('Error in admin-edit-job-version:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
