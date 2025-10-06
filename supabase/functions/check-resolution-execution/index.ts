import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting resolution auto-execution check...');

    // Find resolutions that are ready to be executed
    const { data: resolutions, error: fetchError } = await supabase
      .from('dispute_resolutions')
      .select('*')
      .eq('status', 'agreed')
      .lte('auto_execute_date', new Date().toISOString())
      .is('finalized_at', null);

    if (fetchError) {
      console.error('Error fetching resolutions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${resolutions?.length || 0} resolutions ready for execution`);

    const results = [];
    
    for (const resolution of resolutions || []) {
      try {
        console.log(`Executing resolution ${resolution.id}...`);
        
        // Call the execute_resolution function
        const { error: executeError } = await supabase
          .rpc('execute_resolution', { p_resolution_id: resolution.id });

        if (executeError) {
          console.error(`Error executing resolution ${resolution.id}:`, executeError);
          results.push({
            resolution_id: resolution.id,
            success: false,
            error: executeError.message
          });
        } else {
          console.log(`Successfully executed resolution ${resolution.id}`);
          results.push({
            resolution_id: resolution.id,
            success: true
          });
        }
      } catch (error) {
        console.error(`Exception executing resolution ${resolution.id}:`, error);
        results.push({
          resolution_id: resolution.id,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: resolutions?.length || 0,
        executed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in check-resolution-execution:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
