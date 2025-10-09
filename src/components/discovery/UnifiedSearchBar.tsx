import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UnifiedSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onFilterToggle: () => void;
  showFilters: boolean;
  placeholder?: string;
}

export const UnifiedSearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  onFilterToggle, 
  showFilters,
  placeholder
}: UnifiedSearchBarProps) => {
  const { t } = useTranslation('services');
  
  return (
    <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8">
      <div className="relative flex-1 max-w-2xl mx-auto">
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
        <Input
          type="text"
          placeholder={placeholder || t('hero.searchPlaceholder', 'Search services or professionals...')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 sm:pl-12 h-11 sm:h-14 text-sm sm:text-lg bg-card border-border focus:border-primary focus:ring-primary/20 rounded-lg sm:rounded-xl shadow-sm"
        />
      </div>
      <Button
        variant={showFilters ? "default" : "outline"}
        onClick={onFilterToggle}
        className="h-11 sm:h-14 px-3 sm:px-6 rounded-lg sm:rounded-xl"
      >
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
        <span className="hidden sm:inline">{t('filters.title', 'Filters')}</span>
      </Button>
    </div>
  );
};