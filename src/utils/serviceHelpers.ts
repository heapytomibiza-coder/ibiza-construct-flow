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
    'Outdoor': 'Car',
    'Moving': 'Truck',
    'Cleaning': 'Sparkles',
    'Delivery': 'Package',
    'Personal': 'User'
  };
  
  return iconMap[category] || 'Wrench';
};

export const getMicroServiceIconName = (micro: string, category: string): string => {
  const microIconMap: Record<string, string> = {
    // Moving services
    'Help Moving': 'Truck',
    'Truck Assisted Moving': 'Truck',
    'Heavy Lifting & Loading': 'Package2',
    'Packing Services': 'Package',
    'Unpacking Services': 'PackageOpen',
    
    // Cleaning services
    'House Cleaning': 'Sparkles',
    'Deep Cleaning': 'Sparkles',
    'Post-Party Cleanup': 'Broom',
    'Carpet Cleaning': 'Waves',
    'Window Cleaning': 'Square',
    
    // Delivery services
    'Grocery Shopping': 'ShoppingCart',
    'Personal Shopping': 'ShoppingBag',
    'Same Day Delivery': 'Zap',
    'Furniture Delivery': 'Armchair',
    'Package Pickup': 'Package',
    
    // Personal services
    'Home Organization': 'Home',
    'Office Organization': 'Building',
    'Personal Assistant Tasks': 'User',
    'Wait in Line Service': 'Clock',
    'Dog Walking': 'Dog',
    'Pet Sitting': 'Heart',
    
    // Handyman services
    'IKEA Furniture Assembly': 'Wrench',
    'General Furniture Assembly': 'Hammer',
    'TV Mounting': 'Monitor',
    'Picture & Artwork Hanging': 'Image',
    'Smart Home Installation': 'Smartphone',
    
    // Outdoor services
    'Christmas Lights Installation': 'Lightbulb',
    'Holiday Decorating': 'Star',
    'Pressure Washing': 'Droplets',
    'Gutter Cleaning': 'Home'
  };
  
  return microIconMap[micro] || getServiceIconName(category);
};

export const isPopularService = (category: string): boolean => {
  const popularCategories = ['Handyman', 'Painting', 'Plumbing'];
  return popularCategories.includes(category);
};

export const isPopularMicroService = (micro: string): boolean => {
  const popularMicroServices = [
    'Help Moving', 'House Cleaning', 'IKEA Furniture Assembly', 
    'TV Mounting', 'General Furniture Assembly', 'Deep Cleaning',
    'Grocery Shopping', 'Dog Walking', 'Same Day Delivery'
  ];
  return popularMicroServices.includes(micro);
};