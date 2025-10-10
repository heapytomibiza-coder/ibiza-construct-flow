import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalculatorCard } from '../ui/CalculatorCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { LocationFactor } from '../hooks/useCalculatorState';
import { MapPin } from 'lucide-react';
import { EducationTooltip } from '../ui/EducationTooltip';

interface LocationSelectorProps {
  selected?: LocationFactor;
  onSelect: (location: LocationFactor) => void;
}

export function LocationSelector({ selected, onSelect }: LocationSelectorProps) {
  const [locations, setLocations] = useState<LocationFactor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('calculator_location_factors' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (!error && data) {
        setLocations(data);
        // Auto-select default location
        const defaultLocation = data.find(l => l.is_default);
        if (defaultLocation && !selected) {
          onSelect(defaultLocation);
        }
      }
      setLoading(false);
    };

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Where's the project?</h2>
        <p className="text-muted-foreground">Location affects material costs and logistics</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
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
                  <h3 className="font-semibold text-lg">{location.display_name}</h3>
                </div>
                {location.logistics_notes && (
                  <EducationTooltip content={location.logistics_notes} />
                )}
              </div>

              {location.uplift_percentage > 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-sm">
                  +{location.uplift_percentage}% premium
                </div>
              )}

              {location.logistics_notes && (
                <p className="text-sm text-muted-foreground">{location.logistics_notes}</p>
              )}
            </div>
          </CalculatorCard>
        ))}
      </div>
    </div>
  );
}
