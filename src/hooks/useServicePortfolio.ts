import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useServicePortfolio = (serviceItemId: string) => {
  return useQuery({
    queryKey: ['service-portfolio', serviceItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_service_items')
        .select('portfolio_images, featured_image')
        .eq('id', serviceItemId)
        .single();

      if (error) throw error;
      
      return {
        portfolioImages: (data?.portfolio_images || []) as string[],
        featuredImage: data?.featured_image || null,
      };
    },
    enabled: !!serviceItemId,
  });
};
