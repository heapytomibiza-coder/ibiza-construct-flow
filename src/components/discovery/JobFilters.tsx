import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useCategories } from '@/hooks/useCategories';

interface JobFiltersProps {
  filters: {
    category: string;
    location: string;
    budgetRange: [number, number];
    urgent: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <Card className="p-6 mb-6">
      <h3 className="font-semibold mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, category: value })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.icon_emoji && `${category.icon_emoji} `}
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

        {/* Budget Range */}
        <div className="space-y-2">
          <Label>
            Budget: €{filters.budgetRange[0]} - €{filters.budgetRange[1]}
          </Label>
          <Slider
            value={filters.budgetRange}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, budgetRange: value as [number, number] })
            }
            min={0}
            max={10000}
            step={100}
          />
        </div>
      </div>
    </Card>
  );
}
