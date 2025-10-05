import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, MapPin, Clock, Home, Users } from 'lucide-react';

interface ChipOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  popular?: boolean;
}

interface QuickSelectionChipsProps {
  title: string;
  subtitle?: string;
  options: ChipOption[];
  selectedOptions: string[];
  onSelectionChange: (optionIds: string[]) => void;
  multiSelect?: boolean;
  maxSelection?: number;
}

export const QuickSelectionChips = ({
  title,
  subtitle,
  options,
  selectedOptions,
  onSelectionChange,
  multiSelect = true,
  maxSelection
}: QuickSelectionChipsProps) => {
  const handleToggle = (optionId: string) => {
    if (multiSelect) {
      if (selectedOptions.includes(optionId)) {
        onSelectionChange(selectedOptions.filter(id => id !== optionId));
      } else {
        if (maxSelection && selectedOptions.length >= maxSelection) {
          return; // Don't allow more selections than max
        }
        onSelectionChange([...selectedOptions, optionId]);
      }
    } else {
      onSelectionChange([optionId]);
    }
  };

  return (
    <Card className="p-6 card-luxury">
      <div className="mb-4">
        <h3 className="text-display text-lg font-semibold text-charcoal mb-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-muted-foreground text-sm mb-4">
            {subtitle}
          </p>
        )}
        {maxSelection && multiSelect && (
          <p className="text-xs text-copper mb-4">
            Select up to {maxSelection} options ({selectedOptions.length}/{maxSelection} selected)
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          return (
            <Badge
              key={option.id}
              variant={isSelected ? 'default' : 'outline'}
              className="cursor-pointer hover:opacity-80 transition-all px-3 py-2 text-sm"
              onClick={() => handleToggle(option.id)}
            >
              <div className="flex items-center gap-2">
                {option.icon && (
                  <span className="flex items-center">
                    {option.icon}
                  </span>
                )}
                <span>{option.label}</span>
                {option.popular && !isSelected && (
                  <Badge variant="secondary" className="bg-copper/20 text-copper text-xs px-1 py-0 ml-1">
                    Popular
                  </Badge>
                )}
                {isSelected && (
                  <Check className="w-3 h-3 ml-1" />
                )}
              </div>
            </Badge>
          );
        })}
      </div>
    </Card>
  );
};

// Preset chip configurations for common use cases
export const LocationChips = ({ selectedOptions, onSelectionChange }: {
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
}) => {
  const locationOptions: ChipOption[] = [
    { id: 'ibiza-town', label: 'Ibiza Town', icon: <MapPin className="w-4 h-4" />, popular: true },
    { id: 'san-antonio', label: 'San Antonio', icon: <MapPin className="w-4 h-4" /> },
    { id: 'santa-eulalia', label: 'Santa Eulalia', icon: <MapPin className="w-4 h-4" /> },
    { id: 'playa-den-bossa', label: 'Playa d\'en Bossa', icon: <MapPin className="w-4 h-4" /> },
    { id: 'san-josep', label: 'San Josep', icon: <MapPin className="w-4 h-4" /> },
    { id: 'es-vedra', label: 'Es Vedra Area', icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <QuickSelectionChips
      title="Service Location"
      subtitle="Where do you need the service?"
      options={locationOptions}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={false}
    />
  );
};

export const PropertyTypeChips = ({ selectedOptions, onSelectionChange }: {
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
}) => {
  const propertyOptions: ChipOption[] = [
    { id: 'villa', label: 'Villa', icon: <Home className="w-4 h-4" />, popular: true },
    { id: 'apartment', label: 'Apartment', icon: <Home className="w-4 h-4" /> },
    { id: 'house', label: 'House', icon: <Home className="w-4 h-4" /> },
    { id: 'commercial', label: 'Commercial', icon: <Home className="w-4 h-4" /> },
    { id: 'office', label: 'Office', icon: <Home className="w-4 h-4" /> },
  ];

  return (
    <QuickSelectionChips
      title="Property Type"
      subtitle="What type of property?"
      options={propertyOptions}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={false}
    />
  );
};

export const UrgencyChips = ({ selectedOptions, onSelectionChange }: {
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
}) => {
  const urgencyOptions: ChipOption[] = [
    { id: 'emergency', label: 'Emergency (Same day)', icon: <Clock className="w-4 h-4" /> },
    { id: 'urgent', label: 'Urgent (Within 24h)', icon: <Clock className="w-4 h-4" />, popular: true },
    { id: 'soon', label: 'This week', icon: <Clock className="w-4 h-4" /> },
    { id: 'flexible', label: 'Flexible timing', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <QuickSelectionChips
      title="When do you need this?"
      subtitle="Select your preferred timing"
      options={urgencyOptions}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={false}
    />
  );
};