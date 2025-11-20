import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getErrorMessage } from '../_shared/errorUtils.ts';

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching pending reminders...');
    
    // Get pending reminders
    const { data: reminders, error: fetchError } = await supabase
      .rpc('get_pending_reminders');

    if (fetchError) {
      console.error('Error fetching reminders:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${reminders?.length || 0} pending reminders`);

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending reminders', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    let failedCount = 0;

    // Process each reminder
    for (const reminder of reminders) {
      try {
        console.log(`Processing reminder ${reminder.reminder_id} for ${reminder.user_email}`);

        if (reminder.delivery_method === 'email' && resendApiKey) {
          // Send email via Resend
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'notifications@yourdomain.com',
              to: reminder.user_email,
              subject: `Reminder: ${reminder.event_title}`,
              html: `
                <h2>Upcoming Booking Reminder</h2>
                <p>Hi ${reminder.user_name},</p>
                <p>This is a reminder about your upcoming booking:</p>
                <ul>
                  <li><strong>Event:</strong> ${reminder.event_title}</li>
                  <li><strong>Time:</strong> ${new Date(reminder.event_start).toLocaleString()}</li>
                  ${reminder.event_location ? `<li><strong>Location:</strong> ${JSON.stringify(reminder.event_location)}</li>` : ''}
                </ul>
                <p>See you there!</p>
              `,
            }),
          });

          if (emailResponse.ok) {
            console.log(`Email sent successfully for reminder ${reminder.reminder_id}`);
            await supabase.rpc('mark_reminder_sent', {
              p_reminder_id: reminder.reminder_id,
              p_success: true
            });
            sentCount++;
          } else {
            const errorText = await emailResponse.text();
            console.error(`Failed to send email for reminder ${reminder.reminder_id}:`, errorText);
            await supabase.rpc('mark_reminder_sent', {
              p_reminder_id: reminder.reminder_id,
              p_success: false,
              p_error_message: errorText
            });
            failedCount++;
          }
        } else if (reminder.delivery_method === 'in_app') {
          // Create in-app notification
          await supabase.from('activity_feed').insert({
            user_id: reminder.user_id,
            event_type: 'booking_reminder',
            title: `Upcoming: ${reminder.event_title}`,
            description: `Your booking starts in ${reminder.reminder_type}`,
            entity_type: 'booking',
            entity_id: reminder.booking_id,
            priority: 'high',
            metadata: {
              reminder_type: reminder.reminder_type,
              event_start: reminder.event_start
            }
          });

          await supabase.rpc('mark_reminder_sent', {
            p_reminder_id: reminder.reminder_id,
            p_success: true
          });
          sentCount++;
        } else {
          console.log(`Skipping reminder ${reminder.reminder_id} - delivery method not supported or no API key`);
          failedCount++;
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.reminder_id}:`, error);
        await supabase.rpc('mark_reminder_sent', {
          p_reminder_id: reminder.reminder_id,
          p_success: false,
          p_error_message: getErrorMessage(error)
        });
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Reminders processed',
        total: reminders.length,
        sent: sentCount,
        failed: failedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-booking-reminders function:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
