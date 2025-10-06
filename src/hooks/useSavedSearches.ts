import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchFilters } from './useSearch';

export interface SavedSearch {
  id: string;
  name: string;
  search_query: string | null;
  search_type: string;
  filters: SearchFilters;
  notification_enabled: boolean;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useSavedSearches = () => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSavedSearches = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches((data || []) as SavedSearch[]);
    } catch (error: any) {
      console.error('Error fetching saved searches:', error);
      toast({
        title: 'Failed to load saved searches',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const saveSearch = async (
    name: string,
    searchQuery: string,
    searchType: string,
    filters: SearchFilters,
    notificationEnabled: boolean = false
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('saved_searches').insert({
        name,
        search_query: searchQuery,
        search_type: searchType,
        filters: filters as any,
        notification_enabled: notificationEnabled
      } as any);

      if (error) throw error;

      toast({
        title: 'Search saved',
        description: 'You can access this search anytime from your saved searches.'
      });

      await fetchSavedSearches();
    } catch (error: any) {
      console.error('Error saving search:', error);
      toast({
        title: 'Failed to save search',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteSearch = async (searchId: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;

      toast({
        title: 'Search deleted',
        description: 'Saved search has been removed.'
      });

      await fetchSavedSearches();
    } catch (error: any) {
      console.error('Error deleting search:', error);
      toast({
        title: 'Failed to delete search',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const toggleNotifications = async (searchId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ notification_enabled: enabled })
        .eq('id', searchId);

      if (error) throw error;

      toast({
        title: enabled ? 'Notifications enabled' : 'Notifications disabled',
        description: enabled 
          ? 'You will be notified of new results for this search.'
          : 'You will no longer receive notifications for this search.'
      });

      await fetchSavedSearches();
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      toast({
        title: 'Failed to update notifications',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return {
    savedSearches,
    loading,
    saveSearch,
    deleteSearch,
    toggleNotifications,
    refreshSearches: fetchSavedSearches
  };
};
