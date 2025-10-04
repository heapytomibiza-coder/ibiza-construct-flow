import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://esm.sh/zod@3";
import { preflight } from "../_shared/cors.ts";
import { serverClient } from "../_shared/client.ts";
import { json } from "../_shared/json.ts";

const Input = z.object({
  status: z.enum(['open','closed','in_progress']).optional(),
  q: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  const supabase = serverClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(req.url);
  const parsed = Input.safeParse({
    status: url.searchParams.get('status'),
    q: url.searchParams.get('q'),
    limit: Number(url.searchParams.get('limit') ?? 20),
    offset: Number(url.searchParams.get('offset') ?? 0),
  });

  if (!parsed.success) {
    return json({ error: parsed.error.format() }, 400);
  }

  let query = supabase.from('jobs').select('*', { count: 'exact' });

  if (parsed.data.status) query = query.eq('status', parsed.data.status);
  if (parsed.data.q) query = query.ilike('title', `%${parsed.data.q}%`);

  query = query.range(parsed.data.offset, parsed.data.offset + parsed.data.limit - 1)
              .order('created_at', { ascending: false });

  const { data, error, count } = await query;
  
  if (error) {
    console.error('Error fetching jobs:', error);
    return json({ error: error.message }, 400);
  }

  return json({ 
    data, 
    count, 
    nextOffset: parsed.data.offset + (data?.length ?? 0) 
  });
});
