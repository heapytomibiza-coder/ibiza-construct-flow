import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ServiceSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onFilterToggle: () => void;
  showFilters: boolean;
}

export const ServiceSearch = ({ searchTerm, onSearchChange, onFilterToggle, showFilters }: ServiceSearchProps) => {
  
  return (
    <div className="flex gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-lg border-sand-dark/30 focus:border-copper focus:ring-copper/20"
        />
      </div>
      <Button
        variant={showFilters ? "default" : "outline"}
        onClick={onFilterToggle}
        className="h-12 px-6"
      >
        <Filter className="w-5 h-5 mr-2" />
        Filters
      </Button>
    </div>
  );
};