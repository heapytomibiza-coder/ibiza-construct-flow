import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PopularSearch {
  id: string;
  query: string;
  search_term?: string;
  search_count: number;
  trend_score: number;
  popularity_score?: number;
  category?: string;
}

export const usePopularSearches = (limit = 10) => {
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPopularSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('popular_searches')
        .select('*')
        .gte('period_end', new Date().toISOString())
        .order('trend_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Map database fields to interface
      const mappedData = (data || []).map(item => ({
        id: item.id,
        query: item.query || (item as any).search_term || '',
        search_term: (item as any).search_term || item.query,
        search_count: (item as any).search_count || 0,
        trend_score: item.trend_score || (item as any).popularity_score || 0,
        popularity_score: (item as any).popularity_score || item.trend_score,
        category: item.category
      }));
      
      setPopularSearches(mappedData as PopularSearch[]);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularSearches();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('popular_searches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'popular_searches'
        },
        () => {
          fetchPopularSearches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return {
    popularSearches,
    isLoading,
    refetch: fetchPopularSearches
  };
};
