import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { serverClient } from "../_shared/client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = serverClient(req);
    
    // Get all users who haven't received a digest today
    const today = new Date().toISOString().split('T')[0];
    
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, display_name')
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (usersError) throw usersError;

    for (const user of users || []) {
      // Get unread notifications from the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: notifications, error: notifError } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', user.id)
        .is('read_at', null)
        .gte('created_at', yesterday.toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (notifError) throw notifError;

      if (notifications && notifications.length > 0) {
        // Group by priority
        const highPriority = notifications.filter(n => n.priority === 'high');
        const mediumPriority = notifications.filter(n => n.priority === 'medium');
        const lowPriority = notifications.filter(n => n.priority === 'low' || !n.priority);

        console.log(`User ${user.id} has ${notifications.length} unread notifications`);
        console.log(`High: ${highPriority.length}, Medium: ${mediumPriority.length}, Low: ${lowPriority.length}`);
        
        // TODO: Send email digest via email service
        // This would integrate with SendGrid, Resend, or similar
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${users?.length || 0} users` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});