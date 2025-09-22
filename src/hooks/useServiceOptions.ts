import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceOption {
  id: string;
  service_id: string;
  category: string;
  name: string;
  description: string | null;
  base_price: number;
  price_per_unit: number | null;
  min_quantity: number;
  max_quantity: number | null;
  is_required: boolean;
  display_order: number;
}

interface ServiceAddon {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  price: number;
  is_popular: boolean;
}

export const useServiceOptions = (serviceId: string) => {
  const [options, setOptions] = useState<ServiceOption[]>([]);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    
    const loadServiceOptions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load service options
        const { data: optionsData, error: optionsError } = await supabase
          .from('service_options')
          .select('*')
          .eq('service_id', serviceId)
          .order('display_order');

        if (optionsError) throw optionsError;

        // Load service addons
        const { data: addonsData, error: addonsError } = await supabase
          .from('service_addons')
          .select('*')
          .eq('service_id', serviceId)
          .order('is_popular', { ascending: false });

        if (addonsError) throw addonsError;

        setOptions(optionsData || []);
        setAddons(addonsData || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error loading service options:', err);
      } finally {
        setLoading(false);
      }
    };

    loadServiceOptions();
  }, [serviceId]);

  return {
    options,
    addons,
    loading,
    error,
  };
};