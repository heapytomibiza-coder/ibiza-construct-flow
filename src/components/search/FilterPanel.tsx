/**
 * Filter Panel Component
 * Phase 17: Advanced Search & Filtering System
 * 
 * Sidebar panel for faceted filtering
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Facet, SearchFilter } from '@/lib/search';
import { Badge } from '@/components/ui-enhanced';

interface FilterPanelProps {
  facets: Facet[];
  activeFilters: SearchFilter[];
  onFilterChange: (filter: SearchFilter) => void;
  onFilterRemove: (field: string) => void;
  onClearAll: () => void;
}

export function FilterPanel({
  facets,
  activeFilters,
  onFilterChange,
  onFilterRemove,
  onClearAll,
}: FilterPanelProps) {
  const isFilterActive = (field: string, value: string) => {
    return activeFilters.some(
      f => f.field === field && (Array.isArray(f.value) ? f.value.includes(value) : f.value === value)
    );
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const existingFilter = activeFilters.find(f => f.field === field);

    if (checked) {
      if (existingFilter && Array.isArray(existingFilter.value)) {
        onFilterChange({
          ...existingFilter,
          value: [...existingFilter.value, value],
        });
      } else {
        onFilterChange({
          field,
          operator: 'in',
          value: [value],
        });
      }
    } else {
      if (existingFilter && Array.isArray(existingFilter.value)) {
        const newValue = existingFilter.value.filter((v: string) => v !== value);
        if (newValue.length > 0) {
          onFilterChange({
            ...existingFilter,
            value: newValue,
          });
        } else {
          onFilterRemove(field);
        }
      }
    }
  };

  return (
    <div className="w-64 border-r bg-background/50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filters</h3>
          {activeFilters.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
          )}
        </div>

        {activeFilters.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  removable
                  onRemove={() => onFilterRemove(filter.field)}
                >
                  {filter.label || filter.field}
                </Badge>
              ))}
            </div>
            <Separator className="mb-4" />
          </>
        )}

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">
            {facets.map((facet) => (
              <div key={facet.field}>
                <h4 className="font-medium mb-3">{facet.label}</h4>
                <div className="space-y-2">
                  {facet.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${facet.field}-${option.value}`}
                        checked={isFilterActive(facet.field, option.value)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(facet.field, option.value, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`${facet.field}-${option.value}`}
                        className="flex-1 text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {option.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
