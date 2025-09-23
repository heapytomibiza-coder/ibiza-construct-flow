import { Hammer, Wrench, Paintbrush, Zap, Droplet, Car, Leaf, Shield, UserCheck, Briefcase } from 'lucide-react';
import { QuickSelectionChips } from '@/components/services/QuickSelectionChips';

interface SkillsChipsProps {
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
}

export const SkillsChips = ({ selectedOptions, onSelectionChange }: SkillsChipsProps) => {
  const skillOptions = [
    { id: 'plumbing', label: 'Plumbing', icon: <Droplet className="w-4 h-4" />, popular: true },
    { id: 'electrical', label: 'Electrical', icon: <Zap className="w-4 h-4" />, popular: true },
    { id: 'carpentry', label: 'Carpentry', icon: <Hammer className="w-4 h-4" />, popular: true },
    { id: 'painting', label: 'Painting', icon: <Paintbrush className="w-4 h-4" /> },
    { id: 'general-repair', label: 'General Repair', icon: <Wrench className="w-4 h-4" /> },
    { id: 'automotive', label: 'Automotive', icon: <Car className="w-4 h-4" /> },
    { id: 'gardening', label: 'Gardening', icon: <Leaf className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'cleaning', label: 'Cleaning', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'business', label: 'Business Services', icon: <Briefcase className="w-4 h-4" /> },
  ];

  return (
    <QuickSelectionChips
      title="Your Skills & Services"
      subtitle="Select the services you offer (choose up to 5)"
      options={skillOptions}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={true}
      maxSelection={5}
    />
  );
};