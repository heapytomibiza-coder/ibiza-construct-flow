import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getServiceSlugByCategory, getServiceIconName, isPopularService, formatServicePrice } from '@/utils/serviceHelpers';

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
      setError(null);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category, subcategory, micro');
      
      if (error) throw error;
      setServices(data || []);
      
      // Log successful load for debugging
      console.log(`Loaded ${data?.length || 0} services from database`);
    } catch (err: any) {
      console.error('Error loading services:', err);
      setError(err.message);
      // Set empty array on error so UI doesn't break
      setServices([]);
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
    
    const createServiceCard = (category: string): ServiceWithIcon => ({
      category,
      title: category === 'Construction' ? 'Home Renovations' : `${category} Services`,
      description: getServiceDescription(category),
      priceRange: getServicePriceRange(category),
      popular: isPopularService(category),
      slug: getServiceSlugByCategory(category),
      icon: getServiceIconName(category)
    });

    // Return cards for categories that exist in database, plus fallback defaults
    const dbCards = categories.map(createServiceCard);
    
    // If no database categories, return default cards
    if (dbCards.length === 0) {
      const defaultCategories = ['Handyman', 'Construction', 'Electrical', 'Painting', 'Plumbing', 'HVAC', 'Outdoor'];
      return defaultCategories.map(createServiceCard);
    }
    
    return dbCards;
  };

  const getServiceDescription = (category: string): string => {
    const descriptions: Record<string, string> = {
      'Handyman': 'Quick fixes, small repairs, and maintenance tasks',
      'Construction': 'Kitchen, bathroom, and complete home makeovers', 
      'Electrical': 'Installation, repairs, and safety inspections',
      'Painting': 'Interior and exterior painting, wallpaper, finishes',
      'Plumbing': 'Installation, repairs, and bathroom fitting',
      'HVAC': 'Air conditioning, heating, and ventilation',
      'Outdoor': 'Pool maintenance, garden landscaping, patios'
    };
    return descriptions[category] || 'Professional services for your property';
  };

  const getServicePriceRange = (category: string): string => {
    const ranges: Record<string, string> = {
      'Handyman': '€50 - €500',
      'Construction': '€2K - €50K',
      'Electrical': '€100 - €5K', 
      'Painting': '€200 - €3K',
      'Plumbing': '€80 - €2K',
      'HVAC': '€300 - €8K',
      'Outdoor': '€150 - €15K'
    };
    return ranges[category] || '€50 - €500';
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