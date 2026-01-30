import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FeaturedProfessional {
  id: string;
  user_id: string;
  business_name: string | null;
  full_name: string | null;
  tagline: string | null;
  avatar_url: string | null;
  verification_status: string;
  specializations: string[] | null;
  rating: number | null;
  total_reviews: number | null;
}

/**
 * Fetch featured professionals for homepage
 * Filters for verified professionals with avatars and taglines
 * Over-fetches to ensure we have enough after client-side filtering
 */
export const useFeaturedProfessionals = (limit: number = 6) => {
  return useQuery({
    queryKey: ['featured-professionals', limit],
    queryFn: async (): Promise<FeaturedProfessional[]> => {
      // Fetch more than needed to ensure we have enough after filtering
      // (Supabase can't filter on joined table columns server-side)
      const fetchLimit = Math.max(limit * 3, 20);
      
      const { data, error } = await supabase
        .from('professional_profiles')
        .select(`
          user_id,
          business_name,
          tagline,
          verification_status,
          specializations,
          profiles!professional_profiles_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('verification_status', 'verified')
        .eq('is_active', true)
        .not('tagline', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(fetchLimit);

      if (error) {
        console.error('Error fetching featured professionals:', error);
        return [];
      }

      // Filter for those with avatars, then take only what we need
      return (data || [])
        .filter((pro: any) => pro.profiles?.avatar_url)
        .slice(0, limit)
        .map((pro: any) => ({
          id: pro.user_id,
          user_id: pro.user_id,
          business_name: pro.business_name,
          full_name: pro.profiles?.display_name || null,
          tagline: pro.tagline,
          avatar_url: pro.profiles?.avatar_url,
          verification_status: pro.verification_status,
          specializations: pro.specializations,
          rating: null, // Omit until FK relationship to professional_stats is created
          total_reviews: null,
        }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};
