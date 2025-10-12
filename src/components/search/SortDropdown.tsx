/**
 * Sort Dropdown Component
 * Phase 17: Advanced Search & Filtering System
 * 
 * Dropdown for sorting search results
 */

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortOption } from '@/lib/search';

interface SortDropdownProps {
  value?: SortOption;
  onChange: (sort: SortOption | undefined) => void;
  options: Array<{ field: string; label: string }>;
}

export function SortDropdown({ value, onChange, options }: SortDropdownProps) {
  const handleSort = (field: string) => {
    if (value?.field === field) {
      // Toggle direction or clear
      if (value.direction === 'asc') {
        onChange({ field, direction: 'desc' });
      } else {
        onChange(undefined);
      }
    } else {
      onChange({ field, direction: 'asc' });
    }
  };

  const getSortIcon = (field: string) => {
    if (value?.field !== field) return null;
    return value.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-2" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2" />
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.field}
            onClick={() => handleSort(option.field)}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {getSortIcon(option.field)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
