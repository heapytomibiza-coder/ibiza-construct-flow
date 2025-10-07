import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PrivacyControls {
  id: string;
  data_retention_days: number;
  allow_analytics: boolean;
  allow_marketing: boolean;
  allow_third_party_sharing: boolean;
  encryption_enabled: boolean;
  two_factor_enabled: boolean;
  session_timeout_minutes: number;
  ip_whitelist: string[];
  consent_given_at: string | null;
  consent_version: string | null;
  preferences: any;
}

export const usePrivacyControls = () => {
  const queryClient = useQueryClient();

  const { data: privacyControls, isLoading } = useQuery({
    queryKey: ['privacy-controls'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('data_privacy_controls')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PrivacyControls | null;
    },
  });

  const updatePrivacyControls = useMutation({
    mutationFn: async (updates: Partial<PrivacyControls>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('data_privacy_controls')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-controls'] });
    },
  });

  const giveConsent = useMutation({
    mutationFn: async (version: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('data_privacy_controls')
        .upsert({
          user_id: user.id,
          consent_given_at: new Date().toISOString(),
          consent_version: version,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-controls'] });
    },
  });

  return {
    privacyControls,
    isLoading,
    updatePrivacyControls: updatePrivacyControls.mutate,
    giveConsent: giveConsent.mutate,
  };
};
