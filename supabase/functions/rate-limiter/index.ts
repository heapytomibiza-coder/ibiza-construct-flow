import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitConfig {
  identifier: string; // user_id, ip, api_key, etc.
  action: string; // specific action being rate limited
  maxRequests: number;
  windowSeconds: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { identifier, action, maxRequests, windowSeconds } = await req.json() as RateLimitConfig;

    const now = new Date();
    const windowStart = new Date(now.getTime() - (windowSeconds * 1000));

    // Count requests in the current window
    const { count, error: countError } = await supabase
      .from('rate_limit_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .eq('action', action)
      .gte('created_at', windowStart.toISOString());

    if (countError) {
      throw countError;
    }

    const currentCount = count || 0;

    // Check if limit exceeded
    if (currentCount >= maxRequests) {
      const { data: oldestRequest } = await supabase
        .from('rate_limit_tracking')
        .select('created_at')
        .eq('identifier', identifier)
        .eq('action', action)
        .gte('created_at', windowStart.toISOString())
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      let retryAfter = windowSeconds;
      if (oldestRequest) {
        const resetTime = new Date(oldestRequest.created_at).getTime() + (windowSeconds * 1000);
        retryAfter = Math.ceil((resetTime - now.getTime()) / 1000);
      }

      return new Response(
        JSON.stringify({
          allowed: false,
          limit: maxRequests,
          remaining: 0,
          resetIn: retryAfter,
          message: 'Rate limit exceeded'
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': retryAfter.toString(),
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }

    // Record this request
    const { error: insertError } = await supabase
      .from('rate_limit_tracking')
      .insert({
        identifier,
        action,
        created_at: now.toISOString()
      });

    if (insertError) {
      throw insertError;
    }

    // Clean up old records (older than window)
    await supabase
      .from('rate_limit_tracking')
      .delete()
      .eq('identifier', identifier)
      .eq('action', action)
      .lt('created_at', windowStart.toISOString());

    const remaining = maxRequests - currentCount - 1;

    return new Response(
      JSON.stringify({
        allowed: true,
        limit: maxRequests,
        remaining,
        resetIn: windowSeconds,
        message: 'Request allowed'
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': windowSeconds.toString()
        }
      }
    );
  } catch (error) {
    console.error('Rate limiter error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
