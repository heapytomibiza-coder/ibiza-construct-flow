import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !targetLang) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, targetLang' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use Lovable AI for translation
    const lovableAiUrl = Deno.env.get('LOVABLE_AI_URL');
    const lovableAiKey = Deno.env.get('LOVABLE_AI_KEY');

    if (!lovableAiUrl || !lovableAiKey) {
      console.error('Lovable AI credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Translation service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create translation prompt
    const translationPrompt = `Translate the following text from ${sourceLang || 'detected language'} to ${targetLang}. 
Only provide the translation, no explanations or additional text.

Text to translate:
${text}`;

    const response = await fetch(lovableAiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableAiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // Fast and cost-effective for simple translations
        messages: [
          {
            role: 'user',
            content: translationPrompt,
          },
        ],
        temperature: 0.3, // Low temperature for consistent translations
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error('Translation request failed');
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('No translation received');
    }

    return new Response(
      JSON.stringify({
        translatedText,
        sourceLang: sourceLang || 'auto',
        targetLang,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Translation failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
