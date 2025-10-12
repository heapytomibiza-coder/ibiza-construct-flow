import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event: string;
  data: any;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { event, data, metadata } = await req.json() as WebhookPayload;

    console.log('Webhook received:', { event, data, metadata });

    // Get all active webhook subscriptions for this event
    const { data: subscriptions, error: subError } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('event_type', event)
      .eq('is_active', true);

    if (subError) {
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscriptions for event:', event);
      return new Response(
        JSON.stringify({ message: 'No subscribers for this event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send webhook to all subscribers
    const deliveryPromises = subscriptions.map(async (subscription) => {
      const payload = {
        event,
        data,
        metadata,
        subscription_id: subscription.id,
        timestamp: new Date().toISOString()
      };

      try {
        const response = await fetch(subscription.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': await generateSignature(
              payload,
              subscription.secret_key
            ),
          },
          body: JSON.stringify(payload),
        });

        // Log delivery attempt
        await supabase.from('webhook_deliveries').insert({
          subscription_id: subscription.id,
          event_type: event,
          payload,
          status_code: response.status,
          success: response.ok,
          response_body: await response.text(),
        });

        return {
          subscription_id: subscription.id,
          success: response.ok,
          status: response.status
        };
      } catch (error) {
        console.error('Webhook delivery error:', error);
        
        // Log failed delivery
        await supabase.from('webhook_deliveries').insert({
          subscription_id: subscription.id,
          event_type: event,
          payload,
          success: false,
          error_message: error.message,
        });

        return {
          subscription_id: subscription.id,
          success: false,
          error: error.message
        };
      }
    });

    const deliveryResults = await Promise.all(deliveryPromises);

    const successCount = deliveryResults.filter(r => r.success).length;
    const failureCount = deliveryResults.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: 'Webhook processed',
        delivered: successCount,
        failed: failureCount,
        results: deliveryResults
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function generateSignature(payload: any, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const key = encoder.encode(secret);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
