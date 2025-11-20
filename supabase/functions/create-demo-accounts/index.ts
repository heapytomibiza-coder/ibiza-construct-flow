import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const demoAccounts = [
      { email: 'client.demo@platform.com', password: 'ClientDemo123!', role: 'client', name: 'Client Demo' },
      { email: 'pro.demo@platform.com', password: 'ProDemo123!', role: 'professional', name: 'Professional Demo' },
      { email: 'admin.demo@platform.com', password: 'AdminDemo123!', role: 'admin', name: 'Admin Demo' }
    ];

    const results = [];

    for (const account of demoAccounts) {
      console.log(`Creating demo account: ${account.email}`);
      
      // Create user with admin API
      const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.name
        }
      });

      if (createError) {
        console.error(`Error creating ${account.email}:`, createError);
        results.push({ email: account.email, success: false, error: createError.message });
        continue;
      }

      if (!user.user) {
        console.error(`No user returned for ${account.email}`);
        results.push({ email: account.email, success: false, error: 'No user returned' });
        continue;
      }

      console.log(`User created: ${user.user.id}`);

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.user.id,
          full_name: account.name,
          display_name: account.name,
          active_role: account.role,
          tasker_onboarding_status: 'complete',
          preferred_language: 'en'
        });

      if (profileError) {
        console.error(`Error creating profile for ${account.email}:`, profileError);
        results.push({ email: account.email, success: false, error: `Profile: ${profileError.message}` });
        continue;
      }

      // Assign roles
      const rolesToAssign = account.role === 'admin' 
        ? ['admin', 'professional', 'client']
        : [account.role];

      for (const role of rolesToAssign) {
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: user.user.id,
            role: role
          });

        if (roleError) {
          console.error(`Error assigning role ${role} to ${account.email}:`, roleError);
        }
      }

      console.log(`Successfully created demo account: ${account.email}`);
      results.push({ email: account.email, success: true, userId: user.user.id });
    }

    return new Response(
      JSON.stringify({ 
        message: 'Demo accounts creation completed',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in create-demo-accounts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
