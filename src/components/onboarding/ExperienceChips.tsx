import { Star, Award, Crown, Trophy } from 'lucide-react';
import { QuickSelectionChips } from '@/components/services/QuickSelectionChips';

interface ExperienceChipsProps {
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
}

export const ExperienceChips = ({ selectedOptions, onSelectionChange }: ExperienceChipsProps) => {
  const experienceOptions = [
    { id: 'beginner', label: 'New Professional (0-1 years)', icon: <Star className="w-4 h-4" /> },
    { id: 'intermediate', label: 'Experienced (2-5 years)', icon: <Award className="w-4 h-4" />, popular: true },
    { id: 'advanced', label: 'Highly Experienced (5-10 years)', icon: <Crown className="w-4 h-4" />, popular: true },
    { id: 'expert', label: 'Industry Expert (10+ years)', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <QuickSelectionChips
      title="Experience Level"
      subtitle="How would you describe your professional experience?"
      options={experienceOptions}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={false}
    />
  );
};