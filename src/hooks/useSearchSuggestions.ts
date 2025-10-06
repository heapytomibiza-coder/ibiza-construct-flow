import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchSuggestion {
  id: string;
  suggestion_text: string;
  search_type: string;
  category?: string;
  priority: number;
}

export interface PopularSearch {
  search_term: string;
  search_type: string;
  popularity_score: number;
}

export const useSearchSuggestions = (searchType?: string) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
    fetchPopularSearches();
  }, [searchType]);

  const fetchSuggestions = async () => {
    try {
      let query = (supabase as any)
        .from('search_suggestions')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (searchType) {
        query = query.eq('search_type', searchType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSuggestions(data as SearchSuggestion[] || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularSearches = async () => {
    try {
      const { data, error } = await (supabase as any).rpc('get_popular_searches', {
        p_search_type: searchType || null,
        p_period: 'weekly',
        p_limit: 10
      });

      if (error) throw error;
      setPopularSearches(data || []);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  const getFilteredSuggestions = (query: string, limit = 5): SearchSuggestion[] => {
    if (!query || query.length < 2) return [];

    const lowercaseQuery = query.toLowerCase();
    return suggestions
      .filter(s => s.suggestion_text.toLowerCase().includes(lowercaseQuery))
      .slice(0, limit);
  };

  return {
    suggestions,
    popularSearches,
    loading,
    getFilteredSuggestions,
    refresh: fetchSuggestions
  };
};
