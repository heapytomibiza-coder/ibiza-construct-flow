import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { mapError } from '../_shared/errorMapping.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const auditLogSchema = z.object({
  action: z.string().trim().min(1).max(100),
  resource_type: z.string().trim().min(1).max(50),
  resource_id: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  ip_address: z.string().max(45).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const logEntry = await validateRequestBody(req, auditLogSchema);

    // Get IP address from request
    const ip = req.headers.get('x-forwarded-for') || 
                req.headers.get('x-real-ip') || 
                'unknown';

    // Insert audit log
    const { error: insertError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: logEntry.action,
        resource_type: logEntry.resource_type,
        resource_id: logEntry.resource_id,
        metadata: logEntry.metadata || {},
        ip_address: ip,
        user_agent: req.headers.get('user-agent'),
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Failed to insert audit log:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Audit log error:', error);
    return new Response(
      JSON.stringify({ error: mapError(error) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
