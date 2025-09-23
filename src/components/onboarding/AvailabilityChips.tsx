import { Clock, Calendar, Sun, Moon } from 'lucide-react';
import { QuickSelectionChips } from '@/components/services/QuickSelectionChips';

interface AvailabilityChipsProps {
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
}

export const AvailabilityChips = ({ selectedOptions, onSelectionChange }: AvailabilityChipsProps) => {
  const availabilityOptions = [
    { id: 'weekdays', label: 'Weekdays Only', icon: <Calendar className="w-4 h-4" /> },
    { id: 'weekends', label: 'Weekends Only', icon: <Calendar className="w-4 h-4" /> },
    { id: 'flexible', label: '7 Days a Week', icon: <Clock className="w-4 h-4" />, popular: true },
    { id: 'mornings', label: 'Mornings (8-12)', icon: <Sun className="w-4 h-4" /> },
    { id: 'afternoons', label: 'Afternoons (12-18)', icon: <Sun className="w-4 h-4" /> },
    { id: 'evenings', label: 'Evenings (18-22)', icon: <Moon className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency Calls', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <QuickSelectionChips
      title="Availability"
      subtitle="When are you available to work?"
      options={availabilityOptions}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={true}
    />
  );
};