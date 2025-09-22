// Service utility functions

export const getServiceSlugByCategory = (category: string): string => {
  const slugMap: Record<string, string> = {
    'Handyman': 'handyman',
    'Construction': 'construction', 
    'Electrical': 'electrical',
    'Painting': 'painting',
    'Plumbing': 'plumbing',
    'HVAC': 'hvac',
    'Outdoor': 'outdoor'
  };
  
  return slugMap[category] || category.toLowerCase().replace(/\s+/g, '-');
};

export const getCategoryBySlug = (slug: string): string => {
  const categoryMap: Record<string, string> = {
    'handyman': 'Handyman',
    'construction': 'Construction',
    'renovation': 'Construction', // alias
    'electrical': 'Electrical', 
    'painting': 'Painting',
    'plumbing': 'Plumbing',
    'hvac': 'HVAC',
    'outdoor': 'Outdoor'
  };
  
  return categoryMap[slug] || 'Handyman';
};

export const formatServicePrice = (min: number, max?: number): string => {
  if (!max || max === min) {
    return `€${min}+`;
  }
  
  const formatAmount = (amount: number): string => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
    }
    return amount.toString();
  };
  
  return `€${formatAmount(min)} - €${formatAmount(max)}`;
};

export const getServiceIconName = (category: string): string => {
  const iconMap: Record<string, string> = {
    'Handyman': 'Wrench',
    'Construction': 'Hammer',
    'Electrical': 'Zap',
    'Painting': 'Paintbrush', 
    'Plumbing': 'Droplets',
    'HVAC': 'Thermometer',
    'Outdoor': 'Car'
  };
  
  return iconMap[category] || 'Wrench';
};

export const isPopularService = (category: string): boolean => {
  const popularCategories = ['Handyman', 'Painting', 'Plumbing'];
  return popularCategories.includes(category);
};