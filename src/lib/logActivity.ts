/**
 * Activity Feed Logger
 * Standardized helper for logging user activities
 */

import { supabase } from "@/integrations/supabase/client";

interface LogActivityParams {
  userId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  title: string;
  description?: string;
  actorId?: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
}

export async function logActivity(params: LogActivityParams) {
  const { error } = await supabase.from("activity_feed").insert({
    user_id: params.userId,
    event_type: params.eventType,
    entity_type: params.entityType,
    entity_id: params.entityId,
    title: params.title,
    description: params.description ?? null,
    actor_id: params.actorId ?? null,
    action_url: params.actionUrl ?? null,
    priority: params.priority ?? 'medium',
  });

  if (error) {
    console.error("Error logging activity", error);
  }
}
