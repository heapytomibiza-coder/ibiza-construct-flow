import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CacheEntry {
  key: string;
  data: any;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, key, data, ttl = 300 } = await req.json();

    switch (action) {
      case 'get': {
        const entry = cache.get(key);
        if (!entry) {
          return new Response(
            JSON.stringify({ cached: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if expired
        if (Date.now() > entry.ttl) {
          cache.delete(key);
          return new Response(
            JSON.stringify({ cached: false, expired: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ cached: true, data: entry.data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'set': {
        cache.set(key, {
          key,
          data,
          ttl: Date.now() + (ttl * 1000),
        });

        return new Response(
          JSON.stringify({ success: true, cached: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        const deleted = cache.delete(key);
        return new Response(
          JSON.stringify({ success: true, deleted }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'clear': {
        cache.clear();
        return new Response(
          JSON.stringify({ success: true, cleared: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'stats': {
        // Clean up expired entries
        const now = Date.now();
        let expired = 0;
        for (const [key, entry] of cache.entries()) {
          if (now > entry.ttl) {
            cache.delete(key);
            expired++;
          }
        }

        return new Response(
          JSON.stringify({
            total_entries: cache.size,
            expired_cleaned: expired,
            memory_usage_estimate: cache.size * 1024, // rough estimate in bytes
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
