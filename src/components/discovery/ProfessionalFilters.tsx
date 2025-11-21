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
    <Card className="p-6 mb-6 border-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-foreground">Filter Professionals</h3>
        <span className="text-xs text-muted-foreground">Refine your search</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">📍 Location</Label>
          <Input
            placeholder="e.g., Ibiza Town, Santa Eulalia"
            value={filters.location}
            onChange={(e) =>
              onFiltersChange({ ...filters, location: e.target.value })
            }
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">Search by city or area</p>
        </div>

        {/* Min Rating */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            ⭐ Minimum Rating: <span className="text-primary">{filters.minRating > 0 ? filters.minRating : 'Any'}</span>
          </Label>
          <Slider
            value={[filters.minRating]}
            onValueChange={([value]) =>
              onFiltersChange({ ...filters, minRating: value })
            }
            min={0}
            max={5}
            step={0.5}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">Filter by customer ratings</p>
        </div>

        {/* Verified Only */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">✓ Verification Status</Label>
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
            <Switch
              checked={filters.verified}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, verified: checked })
              }
            />
            <span className="text-sm font-medium text-foreground">
              {filters.verified ? 'Verified only' : 'All professionals'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Show only ID-verified professionals</p>
        </div>
      </div>
    </Card>
  );
}
