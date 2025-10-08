import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceMicroRow, ProfileVerificationAction } from '@/lib/admin/schemas';
import { servicesKeys } from './services';

/**
 * Admin API Client Hooks
 * Phase 4: React Query Integration
 */

// Mutation: Upsert Service Micro
export function useServiceMicroUpsert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ServiceMicroRow) => {
      const { data: result, error } = await supabase.functions.invoke('admin-service-upsert', {
        body: data,
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Upsert failed');

      return result.data;
    },
    onSuccess: () => {
      // Invalidate all service queries to refresh data
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });
}

// Mutation: Moderate Profile
export function useProfileModerate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileVerificationAction) => {
      const { data: result, error } = await supabase.functions.invoke('admin-profile-moderate', {
        body: data,
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Moderation failed');

      return result.data;
    },
    onSuccess: () => {
      // Invalidate profiles queries if they exist
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
