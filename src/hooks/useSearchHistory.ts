import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SearchHistoryItem {
  id: string;
  search_query: string;
  query: string;
  filters: Record<string, any>;
  results_count: number;
  result_count: number;
  created_at: string;
}

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const mappedData = (data || []).map((item: any) => ({
        id: item.id,
        search_query: item.search_query || item.query || '',
        query: item.query || item.search_query || '',
        filters: item.filters,
        results_count: item.results_count || item.result_count || 0,
        result_count: item.result_count || item.results_count || 0,
        created_at: item.created_at
      }));
      
      setHistory(mappedData);
    } catch (error) {
      console.error('Error fetching search history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setHistory([]);
      toast({
        title: 'History cleared',
        description: 'Your search history has been cleared'
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear search history',
        variant: 'destructive'
      });
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting history item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete history item',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    history,
    isLoading,
    clearHistory,
    deleteHistoryItem,
    refetch: fetchHistory
  };
};
