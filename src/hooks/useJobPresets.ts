import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobPreset {
  id: string;
  user_id: string;
  preset_type: string;
  preset_data: any;
  last_used_at: string;
  created_at: string;
}

export function useJobPresets(presetType: string) {
  const [presets, setPresets] = useState<JobPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPresets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('job_presets')
        .select('*')
        .eq('preset_type', presetType)
        .order('last_used_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPresets(data || []);
    } catch (error) {
      console.error('Error fetching presets:', error);
    } finally {
      setLoading(false);
    }
  }, [presetType]);

  useEffect(() => {
    fetchPresets();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`presets:${presetType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_presets',
          filter: `preset_type=eq.${presetType}`
        },
        () => {
          fetchPresets();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [presetType, fetchPresets]);

  const savePreset = useCallback(async (data: Record<string, any>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('job_presets')
        .upsert({
          user_id: user.id,
          preset_type: presetType,
          preset_data: data,
          last_used_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,preset_type',
        });

      if (error) throw error;

      toast({
        title: 'Preset saved',
        description: 'Your selections have been saved for next time',
      });
    } catch (error) {
      console.error('Error saving preset:', error);
      toast({
        title: 'Error saving preset',
        variant: 'destructive',
      });
    }
  }, [presetType, toast]);

  const usePreset = useCallback(async (presetId: string) => {
    try {
      const { error } = await supabase
        .from('job_presets')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', presetId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating preset usage:', error);
    }
  }, []);

  return {
    presets,
    loading,
    savePreset,
    usePreset,
  };
}
