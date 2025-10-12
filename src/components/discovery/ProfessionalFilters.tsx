import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface ProfessionalFiltersProps {
  filters: {
    services: string[];
    location: string;
    minRating: number;
    verified: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export function ProfessionalFilters({ filters, onFiltersChange }: ProfessionalFiltersProps) {
  return (
    <Card className="p-6 mb-6">
      <h3 className="font-semibold mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location */}
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            placeholder="Enter city or area"
            value={filters.location}
            onChange={(e) =>
              onFiltersChange({ ...filters, location: e.target.value })
            }
          />
        </div>

        {/* Min Rating */}
        <div className="space-y-2">
          <Label>Minimum Rating: {filters.minRating || 'Any'}</Label>
          <Slider
            value={[filters.minRating]}
            onValueChange={([value]) =>
              onFiltersChange({ ...filters, minRating: value })
            }
            min={0}
            max={5}
            step={0.5}
          />
        </div>

        {/* Verified Only */}
        <div className="space-y-2">
          <Label>Verified Professionals Only</Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={filters.verified}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, verified: checked })
              }
            />
            <span className="text-sm text-muted-foreground">
              {filters.verified ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
