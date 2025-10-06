import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { report_type, format, date_range } = await req.json();

    if (!report_type || !format) {
      throw new Error('Report type and format are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[Export] Processing ${format} export for ${report_type}`);

    let data: any[] = [];
    let filename = `${report_type}_${new Date().toISOString().split('T')[0]}`;

    // Fetch data based on report type
    switch (report_type) {
      case 'revenue': {
        const { data: payments } = await supabase
          .from('payment_transactions')
          .select('*')
          .in('status', ['completed', 'succeeded'])
          .gte('created_at', date_range?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .lte('created_at', date_range?.end || new Date().toISOString())
          .order('created_at', { ascending: false });
        
        data = payments || [];
        break;
      }
      
      case 'users': {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, full_name, email, created_at, active_role')
          .order('created_at', { ascending: false });
        
        data = users || [];
        break;
      }
      
      case 'bookings': {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .gte('created_at', date_range?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .lte('created_at', date_range?.end || new Date().toISOString())
          .order('created_at', { ascending: false });
        
        data = bookings || [];
        break;
      }
      
      default:
        throw new Error(`Unknown report type: ${report_type}`);
    }

    console.log(`[Export] Fetched ${data.length} records`);

    // Generate export based on format
    let content: string;
    let contentType: string;

    switch (format) {
      case 'csv': {
        if (data.length === 0) {
          content = 'No data available';
        } else {
          const headers = Object.keys(data[0]).join(',');
          const rows = data.map(row => 
            Object.values(row).map(val => 
              typeof val === 'string' && val.includes(',') ? `"${val}"` : val
            ).join(',')
          );
          content = [headers, ...rows].join('\n');
        }
        contentType = 'text/csv';
        filename += '.csv';
        break;
      }
      
      case 'json': {
        content = JSON.stringify(data, null, 2);
        contentType = 'application/json';
        filename += '.json';
        break;
      }
      
      case 'excel':
      case 'pdf': {
        // For MVP, return JSON with note about future implementation
        content = JSON.stringify({
          message: `${format.toUpperCase()} export will be available soon`,
          data: data.slice(0, 100), // Preview first 100 records
          total_records: data.length
        }, null, 2);
        contentType = 'application/json';
        filename += '.json';
        break;
      }
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    console.log(`[Export] Generated ${format} export: ${filename}`);

    // Return file data as base64 for download
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(content);
    const base64 = btoa(String.fromCharCode(...dataBytes));

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        content_type: contentType,
        data: base64,
        download_url: `data:${contentType};base64,${base64}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Export] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
