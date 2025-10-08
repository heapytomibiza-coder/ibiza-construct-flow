import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { action, scenarios } = await req.json();

    if (action !== 'generate_test_sessions') {
      throw new Error('Invalid action');
    }

    // Get or create a test user
    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('id')
      .limit(1);

    const testUserId = profiles && profiles.length > 0 
      ? profiles[0].id 
      : '00000000-0000-0000-0000-000000000000';

    const allEvents = [];
    let sessionCount = 0;

    // Generate success scenarios (complete wizard)
    const successCount = scenarios?.success || 10;
    for (let i = 0; i < successCount; i++) {
      const sessionId = crypto.randomUUID();
      sessionCount++;
      
      // Complete all 7 wizard steps
      for (let step = 1; step <= 7; step++) {
        allEvents.push({
          user_id: testUserId,
          session_id: sessionId,
          event_name: 'wizard_step_viewed',
          event_category: 'wizard_flow',
          event_properties: { 
            step, 
            step_name: `step_${step}`,
            duration_ms: Math.floor(Math.random() * 1500 + 500)
          }
        });
        
        allEvents.push({
          user_id: testUserId,
          session_id: sessionId,
          event_name: 'wizard_step_completed',
          event_category: 'wizard_flow',
          event_properties: { 
            step, 
            step_name: `step_${step}`,
            duration_ms: Math.floor(Math.random() * 1500 + 500)
          }
        });
      }
    }

    // Generate dropoff scenarios (abandon at step 4)
    const dropoffCount = scenarios?.dropoff || 15;
    for (let i = 0; i < dropoffCount; i++) {
      const sessionId = crypto.randomUUID();
      sessionCount++;
      
      // View steps 1-3, complete them
      for (let step = 1; step <= 3; step++) {
        allEvents.push({
          user_id: testUserId,
          session_id: sessionId,
          event_name: 'wizard_step_viewed',
          event_category: 'wizard_flow',
          event_properties: { step, step_name: `step_${step}` }
        });
        
        allEvents.push({
          user_id: testUserId,
          session_id: sessionId,
          event_name: 'wizard_step_completed',
          event_category: 'wizard_flow',
          event_properties: { step, step_name: `step_${step}` }
        });
      }
      
      // View step 4 but abandon
      allEvents.push({
        user_id: testUserId,
        session_id: sessionId,
        event_name: 'wizard_step_viewed',
        event_category: 'wizard_flow',
        event_properties: { step: 4, step_name: 'step_4' }
      });
      
      const reasons = ['complexity', 'confusion', 'page_hidden', 'too_long'];
      allEvents.push({
        user_id: testUserId,
        session_id: sessionId,
        event_name: 'wizard_abandoned',
        event_category: 'wizard_flow',
        event_properties: { 
          step: 4, 
          step_name: 'step_4',
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          time_on_step_ms: Math.floor(Math.random() * 2000 + 3000)
        }
      });
    }

    // Generate error scenarios (validation errors on step 4)
    const errorCount = scenarios?.error || 8;
    for (let i = 0; i < errorCount; i++) {
      const sessionId = crypto.randomUUID();
      sessionCount++;
      
      // Progress through steps 1-4
      for (let step = 1; step <= 4; step++) {
        allEvents.push({
          user_id: testUserId,
          session_id: sessionId,
          event_name: 'wizard_step_viewed',
          event_category: 'wizard_flow',
          event_properties: { step, step_name: `step_${step}` }
        });
      }
      
      // Generate 5-8 validation errors on step 4
      const errorFields = ['location', 'email', 'phone', 'budget', 'description'];
      const numErrors = Math.floor(Math.random() * 4 + 5);
      
      for (let j = 0; j < numErrors; j++) {
        const field = errorFields[Math.floor(Math.random() * errorFields.length)];
        const errorTypes = ['required_field', 'invalid_format', 'too_short', 'too_long'];
        
        allEvents.push({
          user_id: testUserId,
          session_id: sessionId,
          event_name: 'form_validation_error',
          event_category: 'form_interaction',
          event_properties: { 
            field_name: field,
            error_type: errorTypes[Math.floor(Math.random() * errorTypes.length)],
            page_path: '/wizard/step-4',
            step: 4
          }
        });
      }
    }

    // Generate form complexity scenarios (many field focuses)
    const complexityCount = scenarios?.form_complexity || 5;
    for (let i = 0; i < complexityCount; i++) {
      const sessionId = crypto.randomUUID();
      sessionCount++;
      
      allEvents.push({
        user_id: testUserId,
        session_id: sessionId,
        event_name: 'wizard_step_viewed',
        event_category: 'wizard_flow',
        event_properties: { step: 4, step_name: 'step_4' }
      });
      
      // 10 unique field focuses on same page
      const fields = [
        'location', 'email', 'phone', 'budget', 'description',
        'preferred_date', 'alternative_date', 'time_preference',
        'special_requirements', 'contact_preference'
      ];
      
      fields.forEach(field => {
        allEvents.push({
          user_id: testUserId,
          session_id: sessionId,
          event_name: 'form_field_focused',
          event_category: 'form_interaction',
          event_properties: { 
            field_name: field,
            field_type: 'text',
            page_path: '/wizard/step-4'
          }
        });
      });
    }

    console.log(`Generating ${allEvents.length} analytics events across ${sessionCount} sessions`);

    // Insert all events in batches of 100
    const batchSize = 100;
    for (let i = 0; i < allEvents.length; i += batchSize) {
      const batch = allEvents.slice(i, i + batchSize);
      const { error } = await supabaseClient
        .from('analytics_events')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        events_created: allEvents.length,
        sessions_created: sessionCount,
        breakdown: {
          success: successCount,
          dropoff: dropoffCount,
          error: errorCount,
          form_complexity: complexityCount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analytics-seed-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
