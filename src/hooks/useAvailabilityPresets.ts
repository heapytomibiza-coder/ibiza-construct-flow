import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AvailabilityPreset {
  id: string;
  name: string;
  description: string | null;
  working_hours: any;
  is_system: boolean;
  created_by: string | null;
  created_at: string;
}

export function useAvailabilityPresets(userId?: string) {
  const [presets, setPresets] = useState<AvailabilityPreset[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPresets = useCallback(async () => {
    setLoading(true);
    const client: any = supabase;
    
    const { data, error } = await client
      .from('availability_presets')
      .select('*')
      .or(`is_system.eq.true,created_by.eq.${userId}`)
      .order('is_system', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching presets:', error);
      toast.error('Failed to load availability presets');
    } else {
      setPresets(data || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchPresets();
    }
  }, [fetchPresets, userId]);

  const applyPreset = useCallback(async (presetId: string, professionalId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return false;

    const client: any = supabase;
    const { error } = await client
      .from('professional_availability')
      .upsert({
        professional_id: professionalId,
        working_hours: preset.working_hours
      }, {
        onConflict: 'professional_id'
      });

    if (error) {
      console.error('Error applying preset:', error);
      toast.error('Failed to apply preset');
      return false;
    }

    toast.success(`Applied "${preset.name}" preset`);
    return true;
  }, [presets]);

  const createPreset = useCallback(async (
    name: string,
    description: string,
    workingHours: any
  ) => {
    if (!userId) {
      toast.error('You must be logged in');
      return null;
    }

    const client: any = supabase;
    const { data, error } = await client
      .from('availability_presets')
      .insert({
        name,
        description,
        working_hours: workingHours,
        created_by: userId,
        is_system: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating preset:', error);
      toast.error('Failed to create preset');
      return null;
    }

    toast.success('Preset created successfully');
    fetchPresets();
    return data;
  }, [userId, fetchPresets]);

  const deletePreset = useCallback(async (presetId: string) => {
    const client: any = supabase;
    const { error } = await client
      .from('availability_presets')
      .delete()
      .eq('id', presetId);

    if (error) {
      console.error('Error deleting preset:', error);
      toast.error('Failed to delete preset');
      return false;
    }

    toast.success('Preset deleted');
    fetchPresets();
    return true;
  }, [fetchPresets]);

  return {
    presets,
    loading,
    applyPreset,
    createPreset,
    deletePreset,
    refreshPresets: fetchPresets
  };
}
