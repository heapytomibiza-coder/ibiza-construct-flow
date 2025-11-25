/**
 * Advanced Search Hook
 * Phase 13: Enhanced Search & Filtering System
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SearchFilters {
  categories?: string[];
  priceRange?: { min: number; max: number };
  rating?: number;
  location?: string;
  availability?: string;
  verified?: boolean;
}

export const useAdvancedSearch = () => {
  const queryClient = useQueryClient();

  const recordSearch = useMutation({
    mutationFn: async (params: {
      searchType: string;
      query: string;
      filters: SearchFilters;
      resultsCount: number;
      sessionId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('search_history').insert({
        user_id: user?.id,
        search_type: params.searchType,
        search_query: params.query,
        filters: params.filters as any,
        results_count: params.resultsCount,
        session_id: params.sessionId,
      });

      if (error) throw error;
    },
  });

  const { data: trendingSearches } = useQuery({
    queryKey: ['trending-searches'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_trending_searches', { p_limit: 10 });
      if (error) throw error;
      return data;
    },
  });

  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_suggestions')
        .select('*')
        .order('popularity_score', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const incrementSuggestion = useMutation({
    mutationFn: async (text: string) => {
      const { error } = await supabase.rpc('increment_suggestion_popularity', {
        p_suggestion_text: text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-suggestions'] });
    },
  });

  return {
    recordSearch,
    trendingSearches,
    suggestions,
    incrementSuggestion,
  };
};
