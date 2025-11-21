import {
  Hammer,
  Paintbrush,
  Zap,
  Droplet,
  Wind,
  Trees,
  Ruler,
  DoorOpen,
  Wrench,
  Building2,
  FileText,
  Sparkles,
  Bath,
  Home,
  Layers,
  HardHat,
  Square,
  Waves,
  LucideIcon
} from 'lucide-react';

export interface CategoryConfig {
  icon: LucideIcon;
  gradient: string;
  serviceCount: number;
  description?: string;
}

// Mediterranean Sandy Gradients - Professional consistency
const MEDITERRANEAN_GRADIENTS = {
  primary: 'from-sage/20 to-sage-dark/10',
  secondary: 'from-sage-light/15 to-sage/8',
  subtle: 'from-sage-muted/10 to-background/5',
} as const;

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // Main Services - All use primary sandy gradient
  'building': {
    icon: HardHat,
    gradient: MEDITERRANEAN_GRADIENTS.primary,
    serviceCount: 8,
    description: 'General construction and building services'
  },
  'carpentry': {
    icon: Hammer,
    gradient: MEDITERRANEAN_GRADIENTS.primary,
    serviceCount: 6,
    description: 'Custom woodwork and furniture'
  },
  'electrical': {
    icon: Zap,
    gradient: MEDITERRANEAN_GRADIENTS.primary,
    serviceCount: 9,
    description: 'Electrical installations and repairs'
  },
  'plumbing': {
    icon: Droplet,
    gradient: MEDITERRANEAN_GRADIENTS.primary,
    serviceCount: 12,
    description: 'Plumbing and water systems'
  },
  'air-conditioning': {
    icon: Wind,
    gradient: MEDITERRANEAN_GRADIENTS.primary,
    serviceCount: 5,
    description: 'HVAC and climate control'
  },
  'landscaping': {
    icon: Trees,
    gradient: MEDITERRANEAN_GRADIENTS.primary,
    serviceCount: 7,
    description: 'Garden and outdoor maintenance'
  },
  'painting': {
    icon: Paintbrush,
    gradient: MEDITERRANEAN_GRADIENTS.primary,
    serviceCount: 6,
    description: 'Interior and exterior painting'
  },
  'flooring': {
    icon: Square,
    gradient: MEDITERRANEAN_GRADIENTS.secondary,
    serviceCount: 5,
    description: 'Floor installation and repair'
  },
  'windows-doors': {
    icon: DoorOpen,
    gradient: MEDITERRANEAN_GRADIENTS.secondary,
    serviceCount: 4,
    description: 'Window and door services'
  },
  'metalwork': {
    icon: Wrench,
    gradient: MEDITERRANEAN_GRADIENTS.secondary,
    serviceCount: 4,
    description: 'Metal fabrication and welding'
  },
  'handyman': {
    icon: Wrench,
    gradient: MEDITERRANEAN_GRADIENTS.primary,
    serviceCount: 15,
    description: 'General repairs and maintenance'
  },
  'cleaning': {
    icon: Sparkles,
    gradient: MEDITERRANEAN_GRADIENTS.secondary,
    serviceCount: 8,
    description: 'Professional cleaning services'
  },
  
  // Specialist Services - Use subtle gradients
  'architecture': {
    icon: Ruler,
    gradient: MEDITERRANEAN_GRADIENTS.subtle,
    serviceCount: 4,
    description: 'Architectural design and planning'
  },
  'project-management': {
    icon: FileText,
    gradient: MEDITERRANEAN_GRADIENTS.subtle,
    serviceCount: 3,
    description: 'Construction project management'
  },
  'interior-design': {
    icon: Layers,
    gradient: MEDITERRANEAN_GRADIENTS.subtle,
    serviceCount: 5,
    description: 'Interior design and decoration'
  },
  'property-management': {
    icon: Building2,
    gradient: MEDITERRANEAN_GRADIENTS.subtle,
    serviceCount: 6,
    description: 'Property management services'
  },
  'legal-consulting': {
    icon: FileText,
    gradient: MEDITERRANEAN_GRADIENTS.subtle,
    serviceCount: 3,
    description: 'Legal advice and consulting'
  },
  'pool-maintenance': {
    icon: Waves,
    gradient: MEDITERRANEAN_GRADIENTS.secondary,
    serviceCount: 4,
    description: 'Pool cleaning and maintenance'
  },
  'bathroom-renovation': {
    icon: Bath,
    gradient: MEDITERRANEAN_GRADIENTS.secondary,
    serviceCount: 6,
    description: 'Complete bathroom renovations'
  },
  'home-renovation': {
    icon: Home,
    gradient: MEDITERRANEAN_GRADIENTS.primary,
    serviceCount: 10,
    description: 'Full home renovation projects'
  }
};

export const getCategoryConfig = (categorySlug: string): CategoryConfig => {
  return CATEGORY_CONFIG[categorySlug] || {
    icon: Wrench,
    gradient: 'from-primary/20 to-primary/10',
    serviceCount: 0,
    description: 'Professional service'
  };
};
