import { CalculatorCard } from '../ui/CalculatorCard';
import type { LocationFactor } from '@/lib/calculator/data-model';
import { MapPin } from 'lucide-react';
import { EducationTooltip } from '../ui/EducationTooltip';

interface LocationSelectorProps {
  locations: LocationFactor[];
  selected?: LocationFactor;
  onSelect: (location: LocationFactor) => void;
}

export function LocationSelector({ locations, selected, onSelect }: LocationSelectorProps) {

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Where's the project?</h2>
        <p className="text-muted-foreground">Location affects material costs and logistics</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {locations.map(location => (
          <CalculatorCard
            key={location.id}
            selected={selected?.id === location.id}
            onClick={() => onSelect(location)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">{location.name}</h3>
                </div>
                {location.notes && (
                  <EducationTooltip content={location.notes} />
                )}
              </div>

              {location.upliftPercentage > 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-sm">
                  +{(location.upliftPercentage * 100).toFixed(0)}% premium
                </div>
              )}

              {location.notes && (
                <p className="text-sm text-muted-foreground">{location.notes}</p>
              )}
            </div>
          </CalculatorCard>
        ))}
      </div>
    </div>
  );
}
