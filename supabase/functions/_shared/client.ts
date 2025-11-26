import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

export function serverClient(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!; // user context, not service role
  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }
  });
}
