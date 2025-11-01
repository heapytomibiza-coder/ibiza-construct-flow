import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://esm.sh/zod@3";
import { preflight } from "../_shared/cors.ts";
import { serverClient } from "../_shared/client.ts";
import { json } from "../_shared/json.ts";
import { checkRateLimit, STRICT_RATE_LIMIT } from '../_shared/rateLimiter.ts';

const Input = z.object({
  professionalId: z.string().uuid(),
  jobId: z.string().uuid(),
  jobTitle: z.string(),
  jobDescription: z.string(),
  message: z.string().optional(),
});

serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  const supabase = serverClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // Check rate limit (20 invitations per hour to prevent spam)
  const rateLimitCheck = await checkRateLimit(
    supabase,
    user.id,
    'send-professional-invitation',
    STRICT_RATE_LIMIT
  );

  if (!rateLimitCheck.allowed) {
    return json({ error: 'Rate limit exceeded. Please try again later.' }, 429);
  }

  const body = await req.json();
  const parse = Input.safeParse(body);
  
  if (!parse.success) {
    console.error('Validation error:', parse.error);
    return json({ error: parse.error.format() }, 400);
  }

  const { professionalId, jobId, jobTitle, jobDescription, message } = parse.data;

  try {
    // Get professional email
    const { data: professional, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name, email:id(email)')
      .eq('id', professionalId)
      .single();

    if (profError || !professional) {
      console.error('Professional not found:', profError);
      return json({ error: 'Professional not found' }, 404);
    }

    // Get professional's email from auth.users
    const { data: authData } = await supabase.auth.admin.getUserById(professionalId);
    const professionalEmail = authData?.user?.email;

    if (!professionalEmail) {
      console.error('Professional email not found');
      return json({ error: 'Professional email not found' }, 404);
    }

    // Create a conversation between admin and professional
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        participants: [user.id, professionalId],
        job_id: jobId,
        metadata: {
          type: 'job_invitation',
          job_title: jobTitle
        }
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      return json({ error: 'Failed to create conversation' }, 500);
    }

    // Send invitation message
    const invitationMessage = message || `You've been invited to apply for: ${jobTitle}

${jobDescription}

Please review the job details and let us know if you're interested.`;

    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        recipient_id: professionalId,
        content: invitationMessage,
        metadata: {
          type: 'job_invitation',
          job_id: jobId
        }
      });

    if (msgError) {
      console.error('Error sending message:', msgError);
      return json({ error: 'Failed to send invitation message' }, 500);
    }

    // Log activity
    await supabase
      .from('activity_feed')
      .insert({
        user_id: professionalId,
        actor_id: user.id,
        event_type: 'job_invitation',
        title: `New job invitation: ${jobTitle}`,
        description: `You've been invited to apply for ${jobTitle}`,
        entity_type: 'job',
        entity_id: jobId,
        action_url: `/jobs/${jobId}`,
        priority: 'high',
        metadata: {
          job_title: jobTitle,
          conversation_id: conversation.id
        }
      });

    // Send email notification (optional - requires email service)
    // You can integrate with send-email function here

    console.log(`Invitation sent to professional ${professionalId} for job ${jobId}`);

    return json({
      success: true,
      conversation_id: conversation.id,
      message: 'Invitation sent successfully'
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
