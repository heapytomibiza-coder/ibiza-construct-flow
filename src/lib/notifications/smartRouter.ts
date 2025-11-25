/**
 * Smart Notification Router
 * Phase 8: Enhanced Notifications System
 * 
 * Handles intelligent notification routing across channels
 */

import { supabase } from '@/integrations/supabase/client';

export interface NotificationRoutingOptions {
  userId: string;
  notificationId: string;
  title: string;
  body: string;
  category: string;
  url?: string;
  priority?: 'normal' | 'high' | 'urgent';
}

/**
 * Route notification through appropriate channels based on priority and preferences
 */
export async function routeNotification(options: NotificationRoutingOptions) {
  try {
    const { data, error } = await supabase.functions.invoke('smart-notification-router', {
      body: options,
    });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Smart routing error:', error);
    return { success: false, error };
  }
}

/**
 * Check pending escalations and process them
 */
export async function processEscalations() {
  try {
    // Get pending escalations (deliveries that were scheduled for escalation)
    const { data: pendingEscalations, error } = await supabase
      .from('notification_deliveries')
      .select(`
        *,
        notification:activity_feed(*)
      `)
      .eq('channel', 'email')
      .eq('status', 'pending')
      .eq('is_escalated', true)
      .lte('sent_at', new Date().toISOString());

    if (error) throw error;

    if (!pendingEscalations || pendingEscalations.length === 0) {
      return { success: true, processed: 0 };
    }

    let processed = 0;

    for (const escalation of pendingEscalations) {
      // Check if user opened the original push notification
      const { data: originalDelivery } = await supabase
        .from('notification_deliveries')
        .select('opened_at')
        .eq('notification_id', escalation.notification_id)
        .eq('channel', escalation.escalated_from || 'push')
        .maybeSingle();

      // If user opened push, skip escalation
      if (originalDelivery?.opened_at) {
        await supabase
          .from('notification_deliveries')
          .update({ status: 'skipped' })
          .eq('id', escalation.id);
        
        processed++;
        continue;
      }

      // Send email escalation
      // In real implementation, call email sending function here
      console.log(`Escalating notification ${escalation.notification_id} to email`);

      await supabase
        .from('notification_deliveries')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', escalation.id);

      processed++;
    }

    return { success: true, processed };
  } catch (error) {
    console.error('Error processing escalations:', error);
    return { success: false, error };
  }
}
