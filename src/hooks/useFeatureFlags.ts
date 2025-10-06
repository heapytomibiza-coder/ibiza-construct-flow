import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
  target_roles: string[] | null;
  target_users: string[] | null;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feature_flags' as any)
        .select('*')
        .order('name');

      if (error) throw error;
      setFlags((data || []) as unknown as FeatureFlag[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createFlag = async (
    name: string,
    description?: string,
    is_enabled: boolean = false
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('feature_flags' as any).insert({
        name,
        description,
        is_enabled,
      } as any);

      if (error) throw error;

      toast({
        title: 'Feature Flag Created',
        description: `Flag "${name}" has been created.`,
      });

      await fetchFlags();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateFlag = async (
    id: string,
    updates: Partial<Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('feature_flags' as any)
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Feature Flag Updated',
        description: 'The feature flag has been updated.',
      });

      await fetchFlags();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (id: string, is_enabled: boolean) => {
    return updateFlag(id, { is_enabled });
  };

  const deleteFlag = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('feature_flags' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Feature Flag Deleted',
        description: 'The feature flag has been deleted.',
      });

      await fetchFlags();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkFlag = async (flagName: string, userId?: string) => {
    try {
      const { data, error } = await supabase.rpc('check_feature_flag' as any, {
        p_flag_name: flagName,
        p_user_id: userId,
      } as any);

      if (error) throw error;
      return data as boolean;
    } catch (error: any) {
      console.error('Error checking feature flag:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  return {
    flags,
    loading,
    fetchFlags,
    createFlag,
    updateFlag,
    toggleFlag,
    deleteFlag,
    checkFlag,
  };
}
