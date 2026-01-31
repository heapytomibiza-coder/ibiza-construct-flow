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
  skills: string[] | null;
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
      // Over-fetch to ensure we have enough after client-side filtering
      const fetchLimit = Math.max(limit * 4, 30);
      
      // Query the public-safe view directly (no joins, no 401 for anon)
      // View already filters: is_active=true, verification_status='verified', tagline IS NOT NULL
      const { data, error } = await supabase
        .from('public_professionals_preview')
        .select(`
          user_id,
          business_name,
          tagline,
          verification_status,
          skills,
          display_name,
          avatar_url,
          updated_at
        `)
        .order('updated_at', { ascending: false })
        .limit(fetchLimit);

      if (error) {
        console.error('Error fetching featured professionals:', error);
        return [];
      }

      // Filter for those with avatars, then take only what we need
      const filtered = (data || [])
        .filter((pro) => pro.avatar_url)
        .slice(0, limit);

      // Map to expected interface
      return filtered.map((pro) => ({
        id: pro.user_id,
        user_id: pro.user_id,
        business_name: pro.business_name,
        full_name: pro.display_name || null,
        tagline: pro.tagline,
        avatar_url: pro.avatar_url,
        verification_status: pro.verification_status,
        skills: (pro.skills as string[] | null) || null,
        rating: null,
        total_reviews: null,
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
