import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyMatchingProsRequest {
  job_id: string;
  micro_slug: string;
  title: string;
  description: string;
  location?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 notify-matching-pros: Starting...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { job_id, micro_slug, title, description, location }: NotifyMatchingProsRequest = 
      await req.json();

    if (!job_id || !micro_slug) {
      return new Response(
        JSON.stringify({ error: 'job_id and micro_slug are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Job details: ${job_id} | ${micro_slug}`);

    // Step 1: Find the service_id for the micro_slug
    const { data: serviceData, error: serviceError } = await supabase
      .from('services_micro')
      .select('id, name_en, name_es')
      .eq('slug', micro_slug)
      .maybeSingle();

    if (serviceError) {
      console.error('❌ Error fetching service:', serviceError);
      throw serviceError;
    }

    if (!serviceData) {
      console.log(`⚠️ No service found for slug: ${micro_slug}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          notified_count: 0,
          message: 'No matching service found'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Service found: ${serviceData.name_en} (${serviceData.id})`);

    // Step 2: Find all verified professionals offering this service
    const { data: matchingPros, error: prosError } = await supabase
      .from('professional_services')
      .select(`
        professional_id,
        professional_profiles!inner(
          user_id,
          verification_status,
          is_active,
          profiles!inner(
            id,
            full_name,
            email
          )
        )
      `)
      .eq('micro_service_id', serviceData.id)
      .eq('is_active', true)
      .eq('professional_profiles.verification_status', 'verified')
      .eq('professional_profiles.is_active', true);

    if (prosError) {
      console.error('❌ Error fetching professionals:', prosError);
      throw prosError;
    }

    if (!matchingPros || matchingPros.length === 0) {
      console.log(`⚠️ No matching verified professionals found`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          notified_count: 0,
          message: 'No matching professionals found'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`👥 Found ${matchingPros.length} matching professionals`);

    // Step 3: Create notifications for each matching professional
    const notifications = matchingPros.map((pro: any) => ({
      user_id: pro.professional_profiles.user_id,
      title: 'New Job Match',
      description: `New job opportunity: ${title}`,
      notification_type: 'job_match',
      event_type: 'job_posted',
      entity_type: 'job',
      entity_id: job_id,
      action_url: `/job-board?highlight=${job_id}`,
      metadata: {
        job_id,
        job_title: title,
        job_description: description.substring(0, 200),
        location,
        micro_slug,
        service_name: serviceData.name_en,
      },
      priority: 'high',
    }));

    const { data: insertedNotifications, error: notifError } = await supabase
      .from('activity_feed')
      .insert(notifications)
      .select('id');

    if (notifError) {
      console.error('❌ Error creating notifications:', notifError);
      throw notifError;
    }

    console.log(`✅ Created ${insertedNotifications?.length || 0} notifications`);

    // Step 4: Log the matching event for analytics
    await supabase.from('analytics_events').insert({
      event_name: 'job_match_notification',
      event_category: 'jobs',
      event_properties: {
        job_id,
        micro_slug,
        matched_pros_count: matchingPros.length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        notified_count: matchingPros.length,
        job_id,
        service: serviceData.name_en,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ notify-matching-pros error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
