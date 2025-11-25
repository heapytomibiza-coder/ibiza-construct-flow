import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CategoryRating {
  id: string;
  professional_id: string;
  micro_service_id: string | null;
  average_rating: number;
  total_reviews: number;
  avg_timeliness: number;
  avg_communication: number;
  avg_value: number;
  avg_quality: number;
  avg_professionalism: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
  micro_service?: {
    id: string;
    name: string;
    slug: string;
  };
}

export const useCategoryRatings = (professionalId: string) => {
  return useQuery({
    queryKey: ['category-ratings', professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_category_ratings')
        .select(`
          *,
          micro_service:micro_services(id, name, slug)
        `)
        .eq('professional_id', professionalId)
        .order('average_rating', { ascending: false });

      if (error) throw error;
      return data as CategoryRating[];
    },
    enabled: !!professionalId,
  });
};
