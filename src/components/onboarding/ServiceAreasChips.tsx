import { MapPin } from 'lucide-react';
import { QuickSelectionChips } from '@/components/services/QuickSelectionChips';

interface ServiceAreasChipsProps {
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
}

export const ServiceAreasChips = ({ selectedOptions, onSelectionChange }: ServiceAreasChipsProps) => {
  const areaOptions = [
    { id: 'ibiza-town', label: 'Ibiza Town', icon: <MapPin className="w-4 h-4" />, popular: true },
    { id: 'san-antonio', label: 'San Antonio', icon: <MapPin className="w-4 h-4" />, popular: true },
    { id: 'santa-eulalia', label: 'Santa Eulalia', icon: <MapPin className="w-4 h-4" /> },
    { id: 'playa-den-bossa', label: 'Playa d\'en Bossa', icon: <MapPin className="w-4 h-4" /> },
    { id: 'san-josep', label: 'San Josep', icon: <MapPin className="w-4 h-4" /> },
    { id: 'es-vedra', label: 'Es Vedra Area', icon: <MapPin className="w-4 h-4" /> },
    { id: 'cala-llonga', label: 'Cala Llonga', icon: <MapPin className="w-4 h-4" /> },
    { id: 'portinatx', label: 'Portinatx', icon: <MapPin className="w-4 h-4" /> },
    { id: 'anywhere', label: 'Island-wide', icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <QuickSelectionChips
      title="Service Areas"
      subtitle="Where can you provide your services?"
      options={areaOptions}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={true}
    />
  );
};