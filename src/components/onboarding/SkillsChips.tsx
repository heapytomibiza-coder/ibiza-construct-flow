import { getMainCategories, getSpecialistCategories, getServiceIconName } from '@/utils/serviceHelpers';
import { QuickSelectionChips } from '@/components/services/QuickSelectionChips';
import { 
  Hammer, Wrench, Paintbrush, Zap, Droplet, Package, Building2, Ruler, 
  Home, Grid3x3, Layers, Trees, Waves, Wind, HardHat, DoorOpen, Bath, FileText 
} from 'lucide-react';

interface SkillsChipsProps {
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Hammer': <Hammer className="w-4 h-4" />,
    'Droplets': <Droplet className="w-4 h-4" />,
    'Zap': <Zap className="w-4 h-4" />,
    'Wrench': <Wrench className="w-4 h-4" />,
    'Paintbrush': <Paintbrush className="w-4 h-4" />,
    'Grid3x3': <Grid3x3 className="w-4 h-4" />,
    'Layers': <Layers className="w-4 h-4" />,
    'Home': <Home className="w-4 h-4" />,
    'Trees': <Trees className="w-4 h-4" />,
    'Waves': <Waves className="w-4 h-4" />,
    'Wind': <Wind className="w-4 h-4" />,
    'Ruler': <Ruler className="w-4 h-4" />,
    'HardHat': <HardHat className="w-4 h-4" />,
    'DoorOpen': <DoorOpen className="w-4 h-4" />,
    'Bath': <Bath className="w-4 h-4" />,
    'Building2': <Building2 className="w-4 h-4" />,
    'FileText': <FileText className="w-4 h-4" />,
  };
  return icons[iconName] || <Wrench className="w-4 h-4" />;
};

export const SkillsChips = ({ selectedOptions, onSelectionChange }: SkillsChipsProps) => {
  const mainCategories = getMainCategories();
  const specialistCategories = getSpecialistCategories();

  const mainOptions = mainCategories.map(cat => ({
    id: cat,
    label: cat,
    icon: getIconComponent(getServiceIconName(cat)),
    popular: ['Builder', 'Plumber', 'Electrician'].includes(cat)
  }));

  const specialistOptions = specialistCategories.map(cat => ({
    id: cat,
    label: cat,
    icon: getIconComponent(getServiceIconName(cat)),
    popular: false
  }));

  const allOptions = [...mainOptions, ...specialistOptions];

  return (
    <div className="space-y-4">
      <QuickSelectionChips
        title="Main Services"
        subtitle="Core trades and services"
        options={mainOptions}
        selectedOptions={selectedOptions}
        onSelectionChange={onSelectionChange}
        multiSelect={true}
      />
      
      <QuickSelectionChips
        title="Specialist Services"
        subtitle="Specialized and professional services"
        options={specialistOptions}
        selectedOptions={selectedOptions}
        onSelectionChange={onSelectionChange}
        multiSelect={true}
      />
    </div>
  );
};