import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  category: string;
  subcategory: string;
  micro: string;
}

interface ServiceWithIcon {
  category: string;
  title: string;
  description: string;
  priceRange: string;
  popular: boolean;
  slug: string;
  icon: string;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category, subcategory, micro');
      
      if (error) throw error;
      setServices(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    return [...new Set(services.map(s => s.category))];
  };

  const getSubcategories = (category: string) => {
    return [...new Set(
      services
        .filter(s => s.category === category)
        .map(s => s.subcategory)
    )];
  };

  const getMicroServices = (category: string, subcategory: string) => {
    return services.filter(s => 
      s.category === category && s.subcategory === subcategory
    );
  };

  const getServicesByCategory = (category: string) => {
    return services.filter(s => s.category === category);
  };

  // Map database categories to UI service cards
  const getServiceCards = (): ServiceWithIcon[] => {
    const categories = getCategories();
    
    const serviceCardMap: Record<string, ServiceWithIcon> = {
      'Handyman': {
        category: 'Handyman',
        title: 'Handyman Services',
        description: 'Quick fixes, small repairs, and maintenance tasks',
        priceRange: '€50 - €500',
        popular: true,
        slug: 'handyman',
        icon: 'Wrench'
      },
      'Construction': {
        category: 'Construction',
        title: 'Home Renovations',
        description: 'Kitchen, bathroom, and complete home makeovers',
        priceRange: '€2K - €50K',
        popular: false,
        slug: 'construction',
        icon: 'Hammer'
      },
      'Electrical': {
        category: 'Electrical',
        title: 'Electrical Work',
        description: 'Installation, repairs, and safety inspections',
        priceRange: '€100 - €5K',
        popular: false,
        slug: 'electrical',
        icon: 'Zap'
      },
      'Painting': {
        category: 'Painting',
        title: 'Painting & Decorating',
        description: 'Interior and exterior painting, wallpaper, finishes',
        priceRange: '€200 - €3K',
        popular: true,
        slug: 'painting',
        icon: 'Paintbrush'
      },
      'Plumbing': {
        category: 'Plumbing',
        title: 'Plumbing',
        description: 'Installation, repairs, and bathroom fitting',
        priceRange: '€80 - €2K',
        popular: true,
        slug: 'plumbing',
        icon: 'Droplets'
      },
      'HVAC': {
        category: 'HVAC',
        title: 'HVAC Systems',
        description: 'Air conditioning, heating, and ventilation',
        priceRange: '€300 - €8K',
        popular: false,
        slug: 'hvac',
        icon: 'Thermometer'
      },
      'Outdoor': {
        category: 'Outdoor',
        title: 'Pool & Outdoor',
        description: 'Pool maintenance, garden landscaping, patios',
        priceRange: '€150 - €15K',
        popular: false,
        slug: 'outdoor',
        icon: 'Car'
      }
    };

    return categories
      .map(category => serviceCardMap[category])
      .filter(Boolean);
  };

  useEffect(() => {
    loadServices();
  }, []);

  return {
    services,
    loading,
    error,
    loadServices,
    getCategories,
    getSubcategories,
    getMicroServices,
    getServicesByCategory,
    getServiceCards
  };
};