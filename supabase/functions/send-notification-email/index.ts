import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  template_name: string;
  template_data: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process pending emails from queue
    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No emails to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const email of emails) {
      try {
        // Update status to processing
        await supabase
          .from('email_queue')
          .update({ status: 'processing' })
          .eq('id', email.id);

        // In production, this would send actual emails using Resend or similar
        // For now, we'll simulate email sending
        console.log(`Sending email to ${email.recipient_email}: ${email.subject}`);

        // Simulate sending delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Mark as sent
        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', email.id);

        results.push({ id: email.id, status: 'sent' });
      } catch (error: any) {
        console.error(`Error sending email ${email.id}:`, error);

        // Update retry count and status
        const newRetryCount = email.retry_count + 1;
        const shouldRetry = newRetryCount < email.max_retries;

        await supabase
          .from('email_queue')
          .update({
            status: shouldRetry ? 'pending' : 'failed',
            retry_count: newRetryCount,
            error_message: error.message,
            failed_at: shouldRetry ? null : new Date().toISOString(),
          })
          .eq('id', email.id);

        results.push({
          id: email.id,
          status: shouldRetry ? 'retry' : 'failed',
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-notification-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
