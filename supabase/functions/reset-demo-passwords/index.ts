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
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const demoAccounts = [
      { email: 'client.demo@platform.com', password: 'ClientDemo123!' },
      { email: 'pro.demo@platform.com', password: 'ProDemo123!' },
      { email: 'admin.demo@platform.com', password: 'AdminDemo123!' }
    ];

    const results = [];

    for (const account of demoAccounts) {
      console.log(`Processing ${account.email}...`);
      
      // Find user by email
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error(`Error listing users:`, listError);
        results.push({ email: account.email, success: false, error: listError.message });
        continue;
      }

      const user = users.users.find(u => u.email === account.email);
      
      if (!user) {
        console.error(`User not found: ${account.email}`);
        results.push({ email: account.email, success: false, error: 'User not found' });
        continue;
      }

      // Update user password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { 
          password: account.password,
          email_confirm: true
        }
      );

      if (updateError) {
        console.error(`Error updating ${account.email}:`, updateError);
        results.push({ email: account.email, success: false, error: updateError.message });
      } else {
        console.log(`Successfully updated ${account.email}`);
        results.push({ email: account.email, success: true });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Demo password reset completed',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in reset-demo-passwords:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
