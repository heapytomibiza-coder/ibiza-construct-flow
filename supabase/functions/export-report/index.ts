import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { serverClient } from "../_shared/client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = serverClient(req);
    const body = await req.json().catch(() => ({}));

    const key = `reports/${Date.now()}-report.json`;
    const reportData = {
      ...body,
      generated_at: new Date().toISOString(),
      format: 'json',
    };

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('admin-reports')
      .upload(key, JSON.stringify(reportData, null, 2), {
        contentType: 'application/json',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Create signed URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from('admin-reports')
      .createSignedUrl(key, 3600); // 1 hour expiry

    if (urlError) throw urlError;

    return new Response(
      JSON.stringify({ success: true, url: urlData.signedUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Export report error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
