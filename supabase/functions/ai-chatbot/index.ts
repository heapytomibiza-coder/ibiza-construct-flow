import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { 
  checkRateLimitDb, 
  createRateLimitResponse, 
  getClientIdentifier,
  corsHeaders,
  handleCors,
  createAuthenticatedClient,
  createServiceClient
} from '../_shared/securityMiddleware.ts';

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(5000).optional(),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string().max(10000),
  })).max(50).optional(), // Cap conversation history
  conversation_id: z.string().uuid().optional(),
  context: z.object({
    page: z.string().max(200).optional(),
    user_role: z.string().max(50).optional(),
    current_job: z.string().uuid().optional(),
  }).optional().default({}),
});

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        response: 'Please sign in to use the chat assistant.'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with auth header to verify user
    const supabaseClient = createAuthenticatedClient(authHeader);
    const serviceClient = createServiceClient();

    // Verify the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Invalid authentication',
        response: 'Your session has expired. Please sign in again.'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DB-backed rate limiting (20 requests/hour for AI chatbot)
    const clientId = getClientIdentifier(req, user.id);
    const rateLimitResult = await checkRateLimitDb(serviceClient, clientId, 'ai-chatbot', 'AI_STANDARD');
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult);
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const authenticatedUserId = user.id;
    const { message, messages, conversation_id, context } = await validateRequestBody(req, chatRequestSchema);

    // Handle two modes: Simple chat (message) or Custom conversation (messages array)
    const isCustomConversation = messages && Array.isArray(messages);
    
    let aiMessages;
    let conversationRecord;

    if (isCustomConversation) {
      // Custom conversation mode - use provided messages directly
      aiMessages = messages;
    } else {
      // Standard chat mode - use conversation history
      const sessionId = conversation_id || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get or create conversation
      if (conversation_id) {
        const { data } = await supabaseClient
          .from('ai_conversations')
          .select('*')
          .eq('id', conversation_id)
          .single();
        conversationRecord = data;
      }

      if (!conversationRecord) {
        const { data, error } = await supabaseClient
          .from('ai_conversations')
          .insert({
            session_id: sessionId,
            user_id: authenticatedUserId,
            conversation_type: 'support',
            context: context,
            status: 'active'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating conversation:', error);
          throw new Error('Failed to create conversation');
        }
        conversationRecord = data;
      }

      // Get conversation history
      const { data: messageHistory } = await supabaseClient
        .from('ai_chat_messages')
        .select('*')
        .eq('conversation_id', conversationRecord.id)
        .order('created_at', { ascending: true })
        .limit(10);

      // Build context for AI with authenticated user info
      const systemPrompt = buildSystemPrompt({ ...context, authenticated_user_id: authenticatedUserId }, conversationRecord);
      const conversationMessages = messageHistory?.map(msg => ({
        role: msg.role,
        content: msg.content
      })) || [];

      // Add current user message to history
      await supabaseClient
        .from('ai_chat_messages')
        .insert({
          conversation_id: conversationRecord.id,
          role: 'user',
          content: message
        });

      aiMessages = [
        { role: 'system', content: systemPrompt },
        ...conversationMessages,
        { role: 'user', content: message }
      ];
    }

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
        max_completion_tokens: 800,
        stream: false
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status} ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const botResponse = aiData.choices?.[0]?.message?.content || 'I apologize, but I encountered an issue processing your request.';

    // Save AI response to conversation (only in standard chat mode)
    if (!isCustomConversation && conversationRecord) {
      await supabaseClient
        .from('ai_chat_messages')
        .insert({
          conversation_id: conversationRecord.id,
          role: 'assistant',
          content: botResponse,
          metadata: {
            model_used: 'google/gemini-2.5-flash',
            tokens_used: aiData.usage?.total_tokens || 0
          }
        });

      // Generate quick actions based on context and response with authenticated user
      const quickActions = generateQuickActions(message || '', botResponse, { ...context, authenticated_user_id: authenticatedUserId });

      return new Response(JSON.stringify({
        response: botResponse,
        conversation_id: conversationRecord.id,
        session_id: conversationRecord.session_id,
        quick_actions: quickActions,
        context_understood: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For custom conversations, just return the response
    return new Response(JSON.stringify({
      response: botResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logError('ai-chatbot', error);
    return createErrorResponse(error);
  }
});

function buildSystemPrompt(context: any, conversation: any): string {
  const basePrompt = `You are an intelligent customer support assistant for a professional services platform that connects clients with skilled professionals like plumbers, electricians, cleaners, handymen, and other service providers.

Your role is to help users with:
- Finding and booking services
- Understanding the platform features
- Troubleshooting issues
- Providing information about professionals
- Guiding through the booking process
- Explaining pricing and payment options
- Helping with account management

Guidelines:
- Be helpful, friendly, and professional
- Provide accurate information about the platform
- If you don't know something specific, acknowledge it and offer to connect them with human support
- Keep responses concise but comprehensive
- Use a conversational tone
- Suggest relevant actions when appropriate`;

  let contextualInfo = '';
  
  if (context.user_role) {
    contextualInfo += `\nUser role: ${context.user_role}`;
    
    if (context.user_role === 'client') {
      contextualInfo += `\nFocus on helping them find services, book professionals, manage their projects, and understand the client experience.`;
    } else if (context.user_role === 'professional') {
      contextualInfo += `\nFocus on helping them manage their profile, find jobs, handle bookings, and optimize their professional presence.`;
    }
  }
  
  if (context.page) {
    contextualInfo += `\nCurrent page: ${context.page}`;
    contextualInfo += `\nProvide context-relevant help based on what they're currently viewing.`;
  }
  
  if (context.current_job) {
    contextualInfo += `\nThey may be asking about job: ${context.current_job}`;
  }

  return basePrompt + contextualInfo;
}

function generateQuickActions(userMessage: string, botResponse: string, context: any): string[] {
  const actions: string[] = [];
  const lowerMessage = userMessage.toLowerCase();
  
  // Service-related actions
  if (lowerMessage.includes('book') || lowerMessage.includes('hire')) {
    actions.push('Browse Services');
    actions.push('Post a Job');
  }
  
  // Account-related actions
  if (lowerMessage.includes('account') || lowerMessage.includes('profile')) {
    actions.push('View Profile');
    actions.push('Account Settings');
  }
  
  // Payment-related actions
  if (lowerMessage.includes('payment') || lowerMessage.includes('billing')) {
    actions.push('Payment Methods');
    actions.push('Transaction History');
  }
  
  // Help-related actions
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    actions.push('Contact Support');
    actions.push('Help Center');
  }
  
  // Job-related actions
  if (lowerMessage.includes('job') || lowerMessage.includes('project')) {
    if (context.user_role === 'client') {
      actions.push('My Jobs');
      actions.push('Post New Job');
    } else {
      actions.push('Available Jobs');
      actions.push('My Applications');
    }
  }

  // Common actions
  actions.push('Go to Dashboard');
  
  // Return unique actions, limited to 4
  return [...new Set(actions)].slice(0, 4);
}