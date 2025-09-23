import { Globe, MessageCircle } from 'lucide-react';
import { QuickSelectionChips } from '@/components/services/QuickSelectionChips';

interface LanguageChipsProps {
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
}

export const LanguageChips = ({ selectedOptions, onSelectionChange }: LanguageChipsProps) => {
  const languageOptions = [
    { id: 'english', label: 'English', icon: <Globe className="w-4 h-4" />, popular: true },
    { id: 'spanish', label: 'Español', icon: <Globe className="w-4 h-4" />, popular: true },
    { id: 'catalan', label: 'Català', icon: <Globe className="w-4 h-4" />, popular: true },
    { id: 'french', label: 'Français', icon: <Globe className="w-4 h-4" /> },
    { id: 'german', label: 'Deutsch', icon: <Globe className="w-4 h-4" /> },
    { id: 'italian', label: 'Italiano', icon: <Globe className="w-4 h-4" /> },
    { id: 'dutch', label: 'Nederlands', icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <QuickSelectionChips
      title="Languages"
      subtitle="Which languages can you communicate in?"
      options={languageOptions}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={true}
    />
  );
};