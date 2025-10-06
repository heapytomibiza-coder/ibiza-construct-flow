import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeatureFlag {
  key: string;
  description: string | null;
  enabled: boolean;
  audience: Record<string, any>;
  metadata: Record<string, any>;
  updated_at: string;
}

export interface FeatureOverride {
  user_id: string;
  key: string;
  enabled: boolean;
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
        .order('key');

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
    key: string,
    description?: string,
    enabled: boolean = false,
    audience: Record<string, any> = {}
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('feature_flags' as any).insert({
        key,
        description,
        enabled,
        audience,
      } as any);

      if (error) throw error;

      toast({
        title: 'Feature Flag Created',
        description: `Flag "${key}" has been created.`,
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
    key: string,
    updates: Partial<Omit<FeatureFlag, 'key' | 'updated_at'>>
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('feature_flags' as any)
        .update(updates as any)
        .eq('key', key);

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

  const toggleFlag = async (key: string, enabled: boolean) => {
    return updateFlag(key, { enabled });
  };

  const deleteFlag = async (key: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('feature_flags' as any)
        .delete()
        .eq('key', key);

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

  const checkFlag = async (key: string, userId?: string) => {
    try {
      const { data, error } = await supabase.rpc(
        userId ? 'is_feature_enabled' as any : 'is_feature_on' as any,
        userId ? { p_user: userId, p_key: key } : { p_key: key }
      );

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
