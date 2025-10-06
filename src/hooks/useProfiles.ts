import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
}

export const useProfiles = (userIds: string[]) => {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userIds.length === 0) return;

    fetchProfiles();
  }, [userIds.join(',')]);

  const fetchProfiles = async () => {
    if (userIds.length === 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (error) throw error;

      const profileMap: Record<string, Profile> = {};
      (data || []).forEach(p => {
        profileMap[p.id] = p;
      });
      setProfiles(profileMap);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    profiles,
    loading,
    refresh: fetchProfiles
  };
};
