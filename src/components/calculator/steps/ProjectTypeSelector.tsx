import { ChefHat, Droplet, Home } from 'lucide-react';
import { CalculatorCard } from '../ui/CalculatorCard';

interface ProjectTypeSelectorProps {
  selected?: string;
  onSelect: (type: string) => void;
}

const PROJECT_TYPES = [
  {
    key: 'kitchen',
    label: 'Kitchen Renovation',
    icon: ChefHat,
    description: 'Transform your cooking space with new units, worktops, and appliances'
  },
  {
    key: 'bathroom',
    label: 'Bathroom Renovation',
    icon: Droplet,
    description: 'Upgrade your bathroom with new fixtures, tiles, and modern amenities'
  },
  {
    key: 'extension',
    label: 'Home Extension',
    icon: Home,
    description: 'Add extra living space with a professionally built extension'
  }
];

export function ProjectTypeSelector({ selected, onSelect }: ProjectTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">What type of project?</h2>
        <p className="text-muted-foreground">Choose the renovation you're planning</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {PROJECT_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <CalculatorCard
              key={type.key}
              selected={selected === type.key}
              onClick={() => onSelect(type.key)}
            >
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{type.label}</h3>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </CalculatorCard>
          );
        })}
      </div>
    </div>
  );
}
