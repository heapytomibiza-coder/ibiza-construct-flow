// Service utility functions for the 12+6 category system

export const getServiceSlugByCategory = (category: string): string => {
  const slugMap: Record<string, string> = {
    // New 17-category taxonomy
    'Architecture & Design Services': 'architecture-design',
    'Building & Construction Services': 'building-construction',
    'Carpentry & Joinery Services': 'carpentry-joinery',
    'Roofing & Guttering Services': 'roofing-guttering',
    'Electrical & Technology Services': 'electrical-technology',
    'Plumbing & Heating Services': 'plumbing-heating',
    'Air Conditioning & Climate Control Services': 'air-conditioning-climate',
    'Landscaping & Outdoor Construction': 'landscaping-outdoor',
    'Plastering, Painting & Decorating Services': 'plastering-painting-decorating',
    'Flooring, Tiling & Surface Finishes': 'flooring-tiling-surfaces',
    'Doors, Windows & Glazing Services': 'doors-windows-glazing',
    'Metalwork, Welding & Fabrication Services': 'metalwork-welding-fabrication',
    'Project Management & Consultation Services': 'project-management-consultation',
    'Handyman & DIY Jobs': 'handyman-diy',
    'Interior Styling & Custom Furniture': 'interior-styling-furniture',
    'Property Maintenance & Facility Management': 'property-maintenance-facility',
    'Legal & Property Services': 'legal-property',
  };
  
  return slugMap[category] || category.toLowerCase().replace(/\s+/g, '-');
};

export const getCategoryBySlug = (slug: string): string => {
  const categoryMap: Record<string, string> = {
    // New 17-category taxonomy
    'architecture-design': 'Architecture & Design Services',
    'building-construction': 'Building & Construction Services',
    'carpentry-joinery': 'Carpentry & Joinery Services',
    'roofing-guttering': 'Roofing & Guttering Services',
    'electrical-technology': 'Electrical & Technology Services',
    'plumbing-heating': 'Plumbing & Heating Services',
    'air-conditioning-climate': 'Air Conditioning & Climate Control Services',
    'landscaping-outdoor': 'Landscaping & Outdoor Construction',
    'plastering-painting-decorating': 'Plastering, Painting & Decorating Services',
    'flooring-tiling-surfaces': 'Flooring, Tiling & Surface Finishes',
    'doors-windows-glazing': 'Doors, Windows & Glazing Services',
    'metalwork-welding-fabrication': 'Metalwork, Welding & Fabrication Services',
    'project-management-consultation': 'Project Management & Consultation Services',
    'handyman-diy': 'Handyman & DIY Jobs',
    'interior-styling-furniture': 'Interior Styling & Custom Furniture',
    'property-maintenance-facility': 'Property Maintenance & Facility Management',
    'legal-property': 'Legal & Property Services',
  };
  
  return categoryMap[slug] || 'Handyman & DIY Jobs';
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
    // New 17-category taxonomy (emoji icons)
    'Architecture & Design Services': '🏛️',
    'Building & Construction Services': '🏗️',
    'Carpentry & Joinery Services': '🪵',
    'Roofing & Guttering Services': '🧱',
    'Electrical & Technology Services': '⚡',
    'Plumbing & Heating Services': '💧',
    'Air Conditioning & Climate Control Services': '❄️',
    'Landscaping & Outdoor Construction': '🌿',
    'Plastering, Painting & Decorating Services': '🖌️',
    'Flooring, Tiling & Surface Finishes': '🪞',
    'Doors, Windows & Glazing Services': '🚪',
    'Metalwork, Welding & Fabrication Services': '🧰',
    'Project Management & Consultation Services': '🧭',
    'Handyman & DIY Jobs': '🔧',
    'Interior Styling & Custom Furniture': '🪶',
    'Property Maintenance & Facility Management': '🧩',
    'Legal & Property Services': '⚖️',
  };
  
  return iconMap[category] || '🔧';
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
    'Building & Construction Services',
    'Carpentry & Joinery Services',
    'Roofing & Guttering Services',
    'Electrical & Technology Services',
    'Plumbing & Heating Services',
    'Air Conditioning & Climate Control Services',
    'Landscaping & Outdoor Construction',
    'Plastering, Painting & Decorating Services',
    'Flooring, Tiling & Surface Finishes',
    'Doors, Windows & Glazing Services',
    'Metalwork, Welding & Fabrication Services',
    'Handyman & DIY Jobs',
  ];
};

export const getSpecialistCategories = (): string[] => {
  return [
    'Architecture & Design Services',
    'Project Management & Consultation Services',
    'Interior Styling & Custom Furniture',
    'Property Maintenance & Facility Management',
    'Legal & Property Services',
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
