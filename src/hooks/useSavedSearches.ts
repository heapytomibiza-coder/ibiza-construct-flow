import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchFilters } from './useSearch';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  notification_enabled: boolean;
  notification_frequency?: string;
  result_count: number;
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

      // Map database fields to interface
      const mappedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        query: item.search_query || '',
        filters: item.filters as any,
        notification_enabled: item.notify_on_new_results,
        notification_frequency: undefined,
        result_count: 0,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setSavedSearches(mappedData as any);
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
        user_id: user.id,
        name,
        search_query: searchQuery,
        search_type: searchType,
        filters: filters as any,
        notify_on_new_results: notificationEnabled
      });

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
        .update({ notify_on_new_results: enabled })
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
    isLoading: loading,
    saveSearch,
    deleteSearch,
    deleteSavedSearch: deleteSearch,
    updateSavedSearch: async (searchId: string, updates: Partial<SavedSearch>) => {
      try {
        const { error } = await supabase
          .from('saved_searches')
          .update(updates as any)
          .eq('id', searchId);

        if (error) throw error;
        await fetchSavedSearches();
      } catch (error: any) {
        console.error('Error updating search:', error);
        toast({
          title: 'Failed to update search',
          description: error.message,
          variant: 'destructive'
        });
      }
    },
    toggleNotifications,
    refreshSearches: fetchSavedSearches
  };
};
