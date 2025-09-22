import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceWithPricing {
  id: string;
  category: string;
  subcategory: string;
  micro: string;
  title: string;
  description: string;
  priceRange: string;
  slug: string;
  icon: string;
  itemCount: number;
  addonCount: number;
  minPrice: number;
  maxPrice: number;
  rating?: number;
  completedJobs?: number;
  responseTime?: string;
}

export const useServicesWithPricing = () => {
  const [services, setServices] = useState<ServiceWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getMicroServiceDescription = (micro: string): string => {
    const descriptions: Record<string, string> = {
      'House Cleaning': 'Professional house cleaning services with flexible options',
      'Deep Cleaning': 'Thorough deep cleaning for move-ins, move-outs, and special occasions',
      'Post-Party Cleanup': 'Quick cleanup after events and gatherings',
      'Carpet Cleaning': 'Professional carpet and upholstery cleaning services',
      'Window Cleaning': 'Interior and exterior window cleaning for crystal clear views',
      'Furniture Delivery': 'Safe delivery and setup of your furniture purchases',
      'Package Pickup': 'Convenient pickup and delivery of packages and parcels',
      'Same Day Delivery': 'Express delivery service for urgent items',
      'Grocery Shopping': 'Personal shopping and grocery delivery service',
      'Personal Shopping': 'Curated shopping assistance for clothing and gifts',
      'Install light fixture': 'Professional light fixture installation and electrical work',
      'Install ceiling fan': 'Ceiling fan installation with proper electrical connections',
      'Security lighting': 'Outdoor security lighting installation and setup',
      'Smart home setup': 'Smart home device installation and configuration',
    };
    return descriptions[micro] || `Professional ${micro.toLowerCase()} services`;
  };

  const getIconForService = (category: string): string => {
    const iconMap: Record<string, string> = {
      'Cleaning': 'Home',
      'Delivery': 'Car',
      'Electrical': 'Zap',
      'Construction': 'Hammer',
      'Plumbing': 'Droplets',
      'Gardening': 'Thermometer',
      'Painting': 'Paintbrush',
      'Home & Property Services': 'Home',
      'Handyman': 'Wrench',
      'HVAC': 'Thermometer',
      'Moving': 'Car',
      'Outdoor': 'Thermometer',
      'Personal': 'Home',
    };
    return iconMap[category] || 'Wrench';
  };

  useEffect(() => {
    const fetchServicesWithPricing = async () => {
      try {
        setLoading(true);
        
        // Fetch services first
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, category, subcategory, micro');

        if (servicesError) throw servicesError;

        if (!servicesData) {
          setServices([]);
          return;
        }

        // Fetch pricing data for all services
        const { data: itemsData, error: itemsError } = await supabase
          .from('professional_service_items')
          .select('service_id, base_price');

        const { data: addonsData, error: addonsError } = await supabase
          .from('service_addons')
          .select('service_id, id');

        if (itemsError) console.warn('Error fetching items:', itemsError);
        if (addonsError) console.warn('Error fetching addons:', addonsError);

        const servicesWithPricing: ServiceWithPricing[] = servicesData.map(service => {
          const items = (itemsData || []).filter(item => item.service_id === service.id);
          const addons = (addonsData || []).filter(addon => addon.service_id === service.id);
          
          const prices = items.map(item => item.base_price).filter(Boolean);
          const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
          const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
          
          const priceRange = prices.length > 0 
            ? minPrice === maxPrice 
              ? `€${minPrice}`
              : `€${minPrice} - €${maxPrice}`
            : 'Contact for pricing';

          return {
            id: service.id,
            category: service.category,
            subcategory: service.subcategory,
            micro: service.micro,
            title: service.micro,
            description: getMicroServiceDescription(service.micro),
            priceRange,
            slug: service.micro.toLowerCase().replace(/\s+/g, '-'),
            icon: getIconForService(service.category),
            itemCount: items.length,
            addonCount: addons.length,
            minPrice,
            maxPrice,
            rating: 4.8 + Math.random() * 0.4,
            completedJobs: Math.floor(Math.random() * 500) + 50,
            responseTime: ['2h avg', '4h avg', '1 day', 'Same day'][Math.floor(Math.random() * 4)]
          };
        });

        setServices(servicesWithPricing);
      } catch (err) {
        console.error('Error fetching services with pricing:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };

    fetchServicesWithPricing();
  }, []);

  const getCategories = () => {
    return Array.from(new Set(services.map(service => service.category)));
  };

  return {
    services,
    loading,
    error,
    getCategories
  };
};