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

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // Main Services
  'building': {
    icon: HardHat,
    gradient: 'from-orange-500/20 to-amber-500/10',
    serviceCount: 8,
    description: 'General construction and building services'
  },
  'carpentry': {
    icon: Hammer,
    gradient: 'from-amber-700/20 to-yellow-600/10',
    serviceCount: 6,
    description: 'Custom woodwork and furniture'
  },
  'electrical': {
    icon: Zap,
    gradient: 'from-yellow-500/20 to-amber-400/10',
    serviceCount: 9,
    description: 'Electrical installations and repairs'
  },
  'plumbing': {
    icon: Droplet,
    gradient: 'from-blue-500/20 to-cyan-400/10',
    serviceCount: 12,
    description: 'Plumbing and water systems'
  },
  'air-conditioning': {
    icon: Wind,
    gradient: 'from-cyan-500/20 to-blue-400/10',
    serviceCount: 5,
    description: 'HVAC and climate control'
  },
  'landscaping': {
    icon: Trees,
    gradient: 'from-green-500/20 to-emerald-400/10',
    serviceCount: 7,
    description: 'Garden and outdoor maintenance'
  },
  'painting': {
    icon: Paintbrush,
    gradient: 'from-purple-500/20 to-pink-400/10',
    serviceCount: 6,
    description: 'Interior and exterior painting'
  },
  'flooring': {
    icon: Square,
    gradient: 'from-gray-500/20 to-slate-400/10',
    serviceCount: 5,
    description: 'Floor installation and repair'
  },
  'windows-doors': {
    icon: DoorOpen,
    gradient: 'from-indigo-500/20 to-purple-400/10',
    serviceCount: 4,
    description: 'Window and door services'
  },
  'metalwork': {
    icon: Wrench,
    gradient: 'from-slate-600/20 to-gray-500/10',
    serviceCount: 4,
    description: 'Metal fabrication and welding'
  },
  'handyman': {
    icon: Wrench,
    gradient: 'from-red-500/20 to-orange-400/10',
    serviceCount: 15,
    description: 'General repairs and maintenance'
  },
  'cleaning': {
    icon: Sparkles,
    gradient: 'from-teal-500/20 to-cyan-400/10',
    serviceCount: 8,
    description: 'Professional cleaning services'
  },
  
  // Specialist Services
  'architecture': {
    icon: Ruler,
    gradient: 'from-violet-500/20 to-purple-400/10',
    serviceCount: 4,
    description: 'Architectural design and planning'
  },
  'project-management': {
    icon: FileText,
    gradient: 'from-emerald-500/20 to-teal-400/10',
    serviceCount: 3,
    description: 'Construction project management'
  },
  'interior-design': {
    icon: Layers,
    gradient: 'from-pink-500/20 to-rose-400/10',
    serviceCount: 5,
    description: 'Interior design and decoration'
  },
  'property-management': {
    icon: Building2,
    gradient: 'from-teal-500/20 to-cyan-400/10',
    serviceCount: 6,
    description: 'Property management services'
  },
  'legal-consulting': {
    icon: FileText,
    gradient: 'from-blue-700/20 to-indigo-500/10',
    serviceCount: 3,
    description: 'Legal advice and consulting'
  },
  'pool-maintenance': {
    icon: Waves,
    gradient: 'from-blue-400/20 to-cyan-300/10',
    serviceCount: 4,
    description: 'Pool cleaning and maintenance'
  },
  'bathroom-renovation': {
    icon: Bath,
    gradient: 'from-sky-500/20 to-blue-400/10',
    serviceCount: 6,
    description: 'Complete bathroom renovations'
  },
  'home-renovation': {
    icon: Home,
    gradient: 'from-orange-600/20 to-red-400/10',
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
