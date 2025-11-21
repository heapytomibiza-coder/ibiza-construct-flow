import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all services without images
    const { data: services, error: fetchError } = await supabase
      .from('professional_service_items')
      .select('id, name, description, category')
      .is('primary_image_url', null)
      .eq('is_active', true);

    if (fetchError) throw fetchError;

    if (!services || services.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No services need images' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const service of services) {
      try {
        console.log(`Generating image for: ${service.name}`);
        
        // Generate image prompt based on service
        const prompt = `Professional high-quality photo of ${service.name.toLowerCase()}, ${service.description || service.category}, clean and modern, well-lit, professional photography, 4k quality, no text or watermarks`;

        // Call Lovable AI to generate image
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-pro-image-preview',
            messages: [{
              role: 'user',
              content: prompt
            }],
            modalities: ['image', 'text']
          })
        });

        const aiData = await aiResponse.json();
        const imageBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageBase64) {
          console.error(`No image generated for ${service.name}`);
          results.push({ id: service.id, name: service.name, status: 'failed', error: 'No image in response' });
          continue;
        }

        // Convert base64 to blob
        const base64Data = imageBase64.split(',')[1];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        // Upload to storage
        const fileName = `${service.id}.png`;
        const { error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(fileName, binaryData, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(fileName);

        // Update service record
        const { error: updateError } = await supabase
          .from('professional_service_items')
          .update({ primary_image_url: publicUrl })
          .eq('id', service.id);

        if (updateError) throw updateError;

        results.push({ 
          id: service.id, 
          name: service.name, 
          status: 'success',
          imageUrl: publicUrl 
        });

        console.log(`✓ Generated image for ${service.name}`);

      } catch (error: any) {
        console.error(`Error processing ${service.name}:`, error);
        results.push({ 
          id: service.id, 
          name: service.name, 
          status: 'failed', 
          error: error?.message || 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} services`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
