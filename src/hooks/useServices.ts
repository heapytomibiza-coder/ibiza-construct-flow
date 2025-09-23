import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getServiceSlugByCategory, getMicroServiceIconName, isPopularMicroService, formatServicePrice } from '@/utils/serviceHelpers';

interface Service {
  id: string;
  category: string;
  subcategory: string;
  micro: string;
}

interface ServiceWithIcon {
  id: string;
  category: string;
  title: string;
  description: string;
  priceRange: string;
  popular: boolean;
  slug: string;
  icon: string;
  micro: string;
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

  // Map database micro-services to UI service cards  
  const getServiceCards = (): ServiceWithIcon[] => {
    // Return cards for each micro-service instead of categories
    return services.map(service => ({
      id: service.id,
      category: service.category,
      title: service.micro,
      description: getMicroServiceDescription(service.micro, service.category),
      priceRange: getMicroServicePriceRange(service.micro, service.category),
      popular: isPopularMicroService(service.micro),
      slug: getServiceSlugByCategory(service.category),
      icon: getMicroServiceIconName(service.micro, service.category),
      micro: service.micro
    }));
  };

  const getMicroServiceDescription = (micro: string, category: string): string => {
    const descriptions: Record<string, string> = {
      // Moving services
      'Help Moving': 'Professional moving assistance and heavy lifting',
      'Truck Assisted Moving': 'Full-service moving with truck and crew',
      'Heavy Lifting & Loading': 'Safe handling of heavy furniture and appliances',
      'Packing Services': 'Professional packing with quality materials',
      'Unpacking Services': 'Complete unpacking and organising service',
      
      // Cleaning services
      'House Cleaning': 'Regular or one-time house cleaning service',
      'Deep Cleaning': 'Thorough deep cleaning for every room',
      'Post-Party Cleanup': 'Quick cleanup after events and parties',
      'Carpet Cleaning': 'Professional carpet and upholstery cleaning',
      'Window Cleaning': 'Interior and exterior window cleaning',
      
      // Delivery services
      'Grocery Shopping': 'Personal grocery shopping and delivery',
      'Personal Shopping': 'Shopping assistance for any items',
      'Same Day Delivery': 'Fast same-day delivery service',
      'Furniture Delivery': 'Safe furniture delivery and placement',
      'Package Pickup': 'Convenient package pickup and delivery',
      
      // Personal services
      'Home Organization': 'Professional organising and decluttering',
      'Office Organization': 'Workspace organisation and filing',
      'Personal Assistant Tasks': 'Various personal assistance tasks',
      'Wait in Line Service': 'Professional waiting and queuing service',
      'Dog Walking': 'Regular dog walking and exercise',
      'Pet Sitting': 'In-home pet care and sitting',
      
      // Handyman services
      'IKEA Furniture Assembly': 'Expert IKEA furniture assembly',
      'General Furniture Assembly': 'Assembly of any furniture pieces',
      'TV Mounting': 'Professional TV wall mounting service',
      'Picture & Artwork Hanging': 'Precise picture and artwork hanging',
      'Smart Home Installation': 'Smart device setup and installation',
      
      // Outdoor services
      'Christmas Lights Installation': 'Holiday lighting installation and removal',
      'Holiday Decorating': 'Complete holiday decoration service',
      'Pressure Washing': 'High-pressure cleaning for exteriors',
      'Gutter Cleaning': 'Professional gutter cleaning and maintenance'
    };
    
    return descriptions[micro] || `Professional ${micro.toLowerCase()} service`;
  };

  const getMicroServicePriceRange = (micro: string, category: string): string => {
    const ranges: Record<string, string> = {
      // Moving services
      'Help Moving': '€80 - €200',
      'Truck Assisted Moving': '€200 - €600',
      'Heavy Lifting & Loading': '€60 - €150',
      'Packing Services': '€100 - €300',
      'Unpacking Services': '€80 - €250',
      
      // Cleaning services
      'House Cleaning': '€60 - €150',
      'Deep Cleaning': '€120 - €300',
      'Post-Party Cleanup': '€80 - €200',
      'Carpet Cleaning': '€100 - €250',
      'Window Cleaning': '€60 - €120',
      
      // Delivery services
      'Grocery Shopping': '€25 - €50',
      'Personal Shopping': '€30 - €60',
      'Same Day Delivery': '€20 - €80',
      'Furniture Delivery': '€50 - €150',
      'Package Pickup': '€15 - €40',
      
      // Personal services
      'Home Organization': '€80 - €200',
      'Office Organization': '€100 - €250',
      'Personal Assistant Tasks': '€40 - €100',
      'Wait in Line Service': '€25 - €60',
      'Dog Walking': '€20 - €40',
      'Pet Sitting': '€30 - €80',
      
      // Handyman services
      'IKEA Furniture Assembly': '€50 - €120',
      'General Furniture Assembly': '€60 - €150',
      'TV Mounting': '€80 - €150',
      'Picture & Artwork Hanging': '€40 - €80',
      'Smart Home Installation': '€100 - €300',
      
      // Outdoor services
      'Christmas Lights Installation': '€150 - €400',
      'Holiday Decorating': '€100 - €300',
      'Pressure Washing': '€120 - €300',
      'Gutter Cleaning': '€100 - €200'
    };
    
    return ranges[micro] || '€50 - €150';
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