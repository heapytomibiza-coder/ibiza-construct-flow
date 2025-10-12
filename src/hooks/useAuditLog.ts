import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AuditLogParams {
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

export function useAuditLog() {
  const log = useCallback(async (params: AuditLogParams) => {
    try {
      const { error } = await supabase.functions.invoke('audit-log', {
        body: {
          action: params.action,
          resource_type: params.resourceType,
          resource_id: params.resourceId,
          metadata: params.metadata
        }
      });

      if (error) {
        logger.error('Failed to log audit entry', error);
      }
    } catch (error) {
      logger.error('Audit log error', error as Error);
    }
  }, []);

  return { log };
}
