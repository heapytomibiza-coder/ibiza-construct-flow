import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ServicePricingAddon } from '@/types/services';

export const useServicePricingAddons = (serviceItemId: string) => {
  return useQuery({
    queryKey: ['service-pricing-addons', serviceItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_pricing_addons')
        .select('*')
        .eq('service_id', serviceItemId)
        .order('display_order');

      if (error) throw error;
      return (data || []) as ServicePricingAddon[];
    },
    enabled: !!serviceItemId,
  });
};
