import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://esm.sh/zod@3";
import { preflight } from "../_shared/cors.ts";
import { serverClient } from "../_shared/client.ts";
import { json } from "../_shared/json.ts";

const Input = z.object({ jobId: z.string().uuid() });

serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  const supabase = serverClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');
  const parse = Input.safeParse({ jobId });
  
  if (!parse.success) {
    return json({ error: parse.error.format() }, 400);
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', parse.data.jobId)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return json({ error: error.message }, 404);
  }

  return json({ data });
});
