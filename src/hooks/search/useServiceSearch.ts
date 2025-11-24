/**
 * Service Search Hook
 * Queries searchable_services view with filters
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchFilters {
  term?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

interface SearchableService {
  service_item_id: string;
  service_name: string;
  description: string;
  price: number;
  pricing_type: string;
  category: string;
  subcategory: string | null;
  micro: string | null;
  professional_id: string;
  professional_name: string;
  location: any;
  avatar_url: string | null;
  rating_avg: number;
  reviews_count: number;
  portfolio_images: string[] | null;
  featured_image: string | null;
}

export function useServiceSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ['service-search', filters],
    queryFn: async () => {
      let query = supabase
        .from('searchable_services')
        .select('*');

      if (filters.term) {
        query = query.or(`service_name.ilike.%${filters.term}%,description.ilike.%${filters.term}%`);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }
      if (filters.minPrice != null) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice != null) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.minRating != null) {
        query = query.gte('rating_avg', filters.minRating);
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return (data || []) as SearchableService[];
    },
  });
}
