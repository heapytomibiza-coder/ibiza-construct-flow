// Service utility functions for the 12+6 category system

export const getServiceSlugByCategory = (category: string): string => {
  const slugMap: Record<string, string> = {
    'Builder': 'builder',
    'Plumber': 'plumber',
    'Electrician': 'electrician',
    'Carpenter': 'carpenter',
    'Handyman': 'handyman',
    'Painter': 'painter',
    'Tiler': 'tiler',
    'Plasterer': 'plasterer',
    'Roofer': 'roofer',
    'Landscaper': 'landscaper',
    'Pool Builder': 'pool-builder',
    'HVAC': 'hvac',
    'Architects & Design': 'architects-design',
    'Structural Works': 'structural-works',
    'Floors, Doors & Windows': 'floors-doors-windows',
    'Kitchen & Bathroom': 'kitchen-bathroom',
    'Commercial Projects': 'commercial-projects',
    'Legal & Regulatory': 'legal-regulatory'
  };
  
  return slugMap[category] || category.toLowerCase().replace(/\s+/g, '-');
};

export const getCategoryBySlug = (slug: string): string => {
  const categoryMap: Record<string, string> = {
    'builder': 'Builder',
    'plumber': 'Plumber',
    'electrician': 'Electrician',
    'carpenter': 'Carpenter',
    'handyman': 'Handyman',
    'painter': 'Painter',
    'tiler': 'Tiler',
    'plasterer': 'Plasterer',
    'roofer': 'Roofer',
    'landscaper': 'Landscaper',
    'pool-builder': 'Pool Builder',
    'hvac': 'HVAC',
    'architects-design': 'Architects & Design',
    'structural-works': 'Structural Works',
    'floors-doors-windows': 'Floors, Doors & Windows',
    'kitchen-bathroom': 'Kitchen & Bathroom',
    'commercial-projects': 'Commercial Projects',
    'legal-regulatory': 'Legal & Regulatory'
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
    'Builder': 'Hammer',
    'Plumber': 'Droplets',
    'Electrician': 'Zap',
    'Carpenter': 'Wrench',
    'Handyman': 'Wrench',
    'Painter': 'Paintbrush',
    'Tiler': 'Grid3x3',
    'Plasterer': 'Layers',
    'Roofer': 'Home',
    'Landscaper': 'Trees',
    'Pool Builder': 'Waves',
    'HVAC': 'Wind',
    'Architects & Design': 'Ruler',
    'Structural Works': 'HardHat',
    'Floors, Doors & Windows': 'DoorOpen',
    'Kitchen & Bathroom': 'Bath',
    'Commercial Projects': 'Building2',
    'Legal & Regulatory': 'FileText'
  };
  
  return iconMap[category] || 'Wrench';
};

export const isMainCategory = (category: string): boolean => {
  const mainCategories = [
    'Builder', 'Plumber', 'Electrician', 'Carpenter', 
    'Handyman', 'Painter', 'Tiler', 'Plasterer',
    'Roofer', 'Landscaper', 'Pool Builder', 'HVAC'
  ];
  return mainCategories.includes(category);
};

export const isSpecialistCategory = (category: string): boolean => {
  const specialistCategories = [
    'Architects & Design',
    'Structural Works',
    'Floors, Doors & Windows',
    'Kitchen & Bathroom',
    'Commercial Projects',
    'Legal & Regulatory'
  ];
  return specialistCategories.includes(category);
};

export const getMainCategories = (): string[] => {
  return [
    'Builder', 'Plumber', 'Electrician', 'Carpenter',
    'Handyman', 'Painter', 'Tiler', 'Plasterer',
    'Roofer', 'Landscaper', 'Pool Builder', 'HVAC'
  ];
};

export const getSpecialistCategories = (): string[] => {
  return [
    'Architects & Design',
    'Structural Works',
    'Floors, Doors & Windows',
    'Kitchen & Bathroom',
    'Commercial Projects',
    'Legal & Regulatory'
  ];
};

// Legacy functions for backward compatibility
export const getMicroServiceIconName = (micro: string, category: string): string => {
  return getServiceIconName(category);
};

export const isPopularService = (category: string): boolean => {
  // Popular main trades
  const popularCategories = ['Handyman', 'Plumber', 'Electrician', 'Painter'];
  return popularCategories.includes(category);
};

export const isPopularMicroService = (micro: string): boolean => {
  const popularMicroServices = [
    'General Repairs', 'Leak Repairs', 'Socket Installation',
    'Wall Painting', 'IKEA Assembly', 'TV Mounting'
  ];
  return popularMicroServices.includes(micro);
};
