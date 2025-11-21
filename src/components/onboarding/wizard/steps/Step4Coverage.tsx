import { AlertCircle, MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const IBIZA_ZONES = [
  'Ibiza Town', 'San Antonio', 'Santa Eulalia', 'Playa d\'en Bossa',
  'San José', 'San Juan', 'San Carlos', 'Es Canar'
];

const AVAILABILITY_OPTIONS = [
  { value: 'weekdays', label: 'Weekdays', icon: '📅' },
  { value: 'weekends', label: 'Weekends', icon: '🎉' },
  { value: 'mornings', label: 'Mornings', icon: '🌅' },
  { value: 'afternoons', label: 'Afternoons', icon: '☀️' },
  { value: 'evenings', label: 'Evenings', icon: '🌆' },
  { value: 'flexible', label: 'Flexible', icon: '✨' },
];

interface Step4CoverageProps {
  data: {
    regions: string[];
    availability: string[];
  };
  onChange: (field: string, value: string[]) => void;
  errors: Record<string, string>;
}

export function Step4Coverage({ data, onChange, errors }: Step4CoverageProps) {
  const toggleRegion = (region: string) => {
    if (data.regions.includes(region)) {
      onChange('regions', data.regions.filter(r => r !== region));
    } else {
      onChange('regions', [...data.regions, region]);
    }
  };

  const toggleAvailability = (availability: string) => {
    if (data.availability.includes(availability)) {
      onChange('availability', data.availability.filter(a => a !== availability));
    } else {
      onChange('availability', [...data.availability, availability]);
    }
  };

  const selectAllZones = () => {
    onChange('regions', IBIZA_ZONES);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Where & When Are You Available?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Let clients know your service areas and general availability
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Service Areas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Service Areas
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Which zones in Ibiza do you cover?
              </p>
            </div>
            <button
              type="button"
              onClick={selectAllZones}
              className="text-sm text-primary hover:underline"
            >
              Select all
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {IBIZA_ZONES.map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => toggleRegion(zone)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                  "hover:scale-105 hover:shadow-md",
                  data.regions.includes(zone)
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="font-medium">{zone}</div>
                {data.regions.includes(zone) && (
                  <div className="text-xs text-primary mt-1">✓ Selected</div>
                )}
              </button>
            ))}
          </div>

          {errors.regions && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.regions}
            </p>
          )}

          {data.regions.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 border">
              <p className="text-sm font-medium text-muted-foreground">
                🗺️ Covering {data.regions.length} {data.regions.length === 1 ? 'zone' : 'zones'} in Ibiza
              </p>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Availability Preference
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              When are you generally available? (You can set exact hours later)
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABILITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleAvailability(option.value)}
                className={cn(
                  "p-5 rounded-lg border-2 transition-all duration-200",
                  "hover:scale-105 hover:shadow-md flex flex-col items-center gap-2",
                  data.availability.includes(option.value)
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-3xl">{option.icon}</span>
                <span className="font-medium text-center">{option.label}</span>
                {data.availability.includes(option.value) && (
                  <span className="text-xs text-primary">✓ Selected</span>
                )}
              </button>
            ))}
          </div>

          {errors.availability && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.availability}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
