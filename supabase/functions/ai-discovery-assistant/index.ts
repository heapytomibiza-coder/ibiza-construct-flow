import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { 
  checkRateLimitDb, 
  createRateLimitResponse, 
  getClientIdentifier,
  corsHeaders,
  handleCors,
  createServiceClient
} from '../_shared/securityMiddleware.ts';

const discoverySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  context: z.object({
    searchTerm: z.string().max(500).optional(),
    location: z.string().max(200).optional(),
    userLocation: z.any().optional(),
    isAuthenticated: z.boolean().optional(),
    previousMessages: z.array(z.object({
      type: z.string(),
      content: z.string().max(5000),
    })).max(10).optional(),
  }).optional().default({}),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();
    
    // Rate limiting - use IP for anonymous users
    const clientId = getClientIdentifier(req);
    const rateLimitResult = await checkRateLimitDb(supabase, clientId, 'ai-discovery-assistant', 'AI_STANDARD');
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter);
    }

    const { message, context } = await validateRequestBody(req, discoverySchema);

    // Ensure context has default values
    const ctx = context || {};

    // Create system prompt for discovery assistant
    const systemPrompt = `You are an AI Discovery Assistant for CS Ibiza Elite Network, a premium marketplace connecting clients with professional service providers in Ibiza, Spain.

ROLE: Help users discover and book the perfect services and professionals for their needs in Ibiza.

CONTEXT:
- Current search: ${ctx.searchTerm || 'None'}
- User location: ${ctx.location || 'Unknown'}
- Authentication: ${ctx.isAuthenticated ? 'Logged in' : 'Not logged in'}

AVAILABLE SERVICES:
- Home & Cleaning: House cleaning, deep cleaning, post-party cleanup, carpet cleaning, window cleaning
- Moving & Delivery: Help moving, truck-assisted moving, heavy lifting, packing/unpacking, grocery shopping, same-day delivery
- Personal Services: Home organization, personal assistant tasks, dog walking, pet sitting, wait-in-line service
- Handyman: IKEA assembly, furniture assembly, TV mounting, picture hanging, smart home installation
- Outdoor: Christmas lights installation, holiday decorating, pressure washing, gutter cleaning
- Professional Services: Various skilled professionals available

RESPONSE GUIDELINES:
1. Be helpful, friendly, and knowledgeable about Ibiza services
2. Ask clarifying questions to better understand needs
3. Provide specific service recommendations with brief explanations
4. Consider location context (Ibiza Town, San Antonio, Santa Eulalia, etc.)
5. Suggest 2-4 practical follow-up suggestions
6. Keep responses concise but informative
7. Use encouraging language that builds confidence in booking

RESPONSE FORMAT:
Provide a JSON response with:
- response: Main helpful message
- suggestions: Array of 2-4 follow-up questions/actions
- recommendations: Array of specific services to highlight (optional)

EXAMPLES:
- If asked about cleaning: Recommend house cleaning for regular maintenance, deep cleaning for move-in/out, post-party cleanup for events
- If asked about moving: Suggest help moving for small jobs, truck-assisted for full moves, packing services for fragile items
- If location mentioned: Tailor suggestions to that area's common needs

Remember: You're helping people find trusted professionals in beautiful Ibiza. Be enthusiastic about the quality of service providers available.`

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(ctx.previousMessages?.slice(-2).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })) || []),
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const assistantMessage = aiData.choices[0]?.message?.content || 'I apologize, but I cannot process that request right now.'

    // Try to parse JSON response, fallback to plain text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(assistantMessage);
    } catch {
      // Fallback for plain text responses
      parsedResponse = {
        response: assistantMessage,
        suggestions: generateContextualSuggestions(message, context),
        recommendations: []
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    logError('ai-discovery-assistant', error);
    return new Response(
      JSON.stringify({ 
        response: "I'm sorry, I'm having trouble right now. Please try asking again in a moment.",
        suggestions: ['Try a different question', 'Browse services manually', 'Contact support']
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

function generateContextualSuggestions(message: string, context: any): string[] {
  const lowerMessage = message.toLowerCase();
  
  // Context-based suggestions
  if (lowerMessage.includes('clean')) {
    return ['What type of cleaning?', 'When do you need it?', 'How large is the space?', 'Regular or one-time?'];
  }
  
  if (lowerMessage.includes('move') || lowerMessage.includes('moving')) {
    return ['Local or long-distance?', 'Do you need packing help?', 'How much furniture?', 'When is your move date?'];
  }
  
  if (lowerMessage.includes('handyman') || lowerMessage.includes('repair') || lowerMessage.includes('fix')) {
    return ['What needs to be fixed?', 'IKEA assembly?', 'TV mounting?', 'Smart home setup?'];
  }
  
  if (lowerMessage.includes('personal') || lowerMessage.includes('assistant')) {
    return ['Organization help?', 'Pet care services?', 'Grocery shopping?', 'Waiting services?'];
  }
  
  // Default suggestions
  return ['Tell me more details', 'What\'s your location?', 'When do you need this?', 'What\'s your budget range?'];
}