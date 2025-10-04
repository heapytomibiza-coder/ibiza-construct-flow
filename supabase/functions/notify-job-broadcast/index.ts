import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { jobId } = await req.json();

    console.log('[notify-job-broadcast] Processing job:', jobId);

    // 1. Get job details with micro service info
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, title, micro_id, location, created_at, client_id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('[notify-job-broadcast] Job not found:', jobError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Find matching professionals with subscription tiers
    // Priority: premium > pro > basic
    const { data: professionals, error: proError } = await supabase
      .from('professional_profiles')
      .select('user_id, subscription_tier, service_areas')
      .eq('is_active', true)
      .order('subscription_tier', { ascending: false }); // premium first

    if (proError) {
      console.error('[notify-job-broadcast] Error fetching professionals:', proError);
      throw proError;
    }

    console.log(`[notify-job-broadcast] Found ${professionals?.length || 0} active professionals`);

    // 3. Create notifications for all qualified professionals
    const notifications = (professionals || []).map((pro) => {
      const priority = 
        pro.subscription_tier === 'premium' ? 'high' : 
        pro.subscription_tier === 'pro' ? 'medium' : 'normal';

      return {
        user_id: pro.user_id,
        title: '🔔 New Job Available',
        message: `New ${job.title} job posted in your area`,
        type: 'job_match',
        action_url: `/marketplace?job=${jobId}`,
        metadata: {
          jobId: job.id,
          priority,
          subscriptionTier: pro.subscription_tier,
          jobTitle: job.title
        }
      };
    });

    // 4. Batch insert notifications
    if (notifications.length > 0) {
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifyError) {
        console.error('[notify-job-broadcast] Error creating notifications:', notifyError);
        throw notifyError;
      }

      console.log(`[notify-job-broadcast] Created ${notifications.length} notifications`);
    }

    // 5. Record broadcast stats
    const { error: broadcastError } = await supabase
      .from('job_broadcasts')
      .insert({
        job_id: jobId,
        broadcast_type: 'tier_based',
        professionals_notified: notifications.length,
        target_criteria: {
          tiers: ['premium', 'pro', 'basic'],
          service_id: job.micro_id,
          timestamp: new Date().toISOString()
        },
        created_by: job.client_id
      });

    if (broadcastError) {
      console.warn('[notify-job-broadcast] Error recording broadcast stats:', broadcastError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: notifications.length,
        jobId: job.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[notify-job-broadcast] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
