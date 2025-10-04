import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { preflight } from "../_shared/cors.ts";
import { serverClient } from "../_shared/client.ts";
import { json } from "../_shared/json.ts";

serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  const supabase = serverClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return json({ data: null });
  }

  // Fetch profile & roles from new user_roles table
  const [{ data: profile }, { data: roles, error: rolesErr }] = await Promise.all([
    supabase.from('profiles')
      .select('display_name,preferred_language,tasker_onboarding_status,active_role')
      .eq('id', user.id)
      .single(),
    supabase.from('user_roles')
      .select('role')
      .eq('user_id', user.id)
  ]);

  if (rolesErr) {
    console.error('Error fetching roles:', rolesErr);
    return json({ error: rolesErr.message }, 500);
  }

  // Map DB roles to frontend terminology
  const rolesNorm = (roles ?? []).map(r =>
    r.role === 'client' ? 'asker'
    : r.role === 'professional' ? 'tasker'
    : 'admin'
  );

  const activeNorm =
    profile?.active_role === 'client' ? 'asker'
    : profile?.active_role === 'professional' ? 'tasker'
    : profile?.active_role ?? null;

  return json({
    data: {
      userId: user.id,
      email: user.email ?? null,
      roles: rolesNorm,
      verified: !!user.email_confirmed_at,
      activeRole: activeNorm,
      profile: {
        display_name: profile?.display_name ?? null,
        preferred_language: profile?.preferred_language ?? null,
        onboarding_status: profile?.tasker_onboarding_status ?? null
      }
    }
  });
});
