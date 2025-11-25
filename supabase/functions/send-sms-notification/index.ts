import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSPayload {
  userId: string;
  notificationId: string;
  message: string;
  isUrgent?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: SMSPayload = await req.json();
    const { userId, notificationId, message, isUrgent = false } = payload;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user should receive SMS
    const { data: shouldSend } = await supabaseClient.rpc('should_send_notification', {
      p_user_id: userId,
      p_notification_id: notificationId,
      p_channel: 'sms',
      p_category: isUrgent ? 'urgent' : 'system',
    });

    if (!shouldSend) {
      console.log(`SMS skipped for user ${userId} (preferences/rules)`);
      
      await supabaseClient.from('notification_deliveries').insert({
        notification_id: notificationId,
        user_id: userId,
        channel: 'sms',
        status: 'skipped',
      });

      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'User preferences' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's verified phone number
    const { data: phoneNumber, error: phoneError } = await supabaseClient
      .from('user_phone_numbers')
      .select('*')
      .eq('user_id', userId)
      .eq('is_verified', true)
      .eq('is_primary', true)
      .maybeSingle();

    if (phoneError) throw phoneError;

    if (!phoneNumber) {
      console.log(`No verified phone number for user ${userId}`);
      
      await supabaseClient.from('notification_deliveries').insert({
        notification_id: notificationId,
        user_id: userId,
        channel: 'sms',
        status: 'failed',
        error_message: 'No verified phone number',
      });

      return new Response(
        JSON.stringify({ success: false, error: 'No verified phone number' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', phoneNumber.phone_number);
    formData.append('From', twilioPhoneNumber);
    formData.append('Body', message);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Twilio error: ${result.message || response.statusText}`);
    }

    // Log successful delivery
    await supabaseClient.from('notification_deliveries').insert({
      notification_id: notificationId,
      user_id: userId,
      channel: 'sms',
      status: 'sent',
      sent_at: new Date().toISOString(),
      provider_id: result.sid,
      provider_response: result,
    });

    console.log(`SMS sent successfully to ${phoneNumber.phone_number}, SID: ${result.sid}`);

    return new Response(
      JSON.stringify({
        success: true,
        sid: result.sid,
        status: result.status,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Log failed delivery
    try {
      const { userId, notificationId } = await req.clone().json();
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseClient.from('notification_deliveries').insert({
        notification_id: notificationId,
        user_id: userId,
        channel: 'sms',
        status: 'failed',
        failed_at: new Date().toISOString(),
        error_message: errorMessage,
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
