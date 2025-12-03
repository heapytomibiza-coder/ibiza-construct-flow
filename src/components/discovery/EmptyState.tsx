import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'no-search' | 'no-results';
  searchTerm?: string;
  onClearSearch?: () => void;
  viewMode?: 'services' | 'professionals';
}

export const EmptyState = ({ type, searchTerm, onClearSearch, viewMode = 'services' }: EmptyStateProps) => {
  const { t } = useTranslation('common');

  if (type === 'no-search') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-lg border">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
          <Search className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {viewMode === 'services' ? t('browseServices') : t('browseProfessionals')}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          {viewMode === 'services' 
            ? t('searchDescription')
            : t('searchDescriptionPros')
          }
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-lg border">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Sparkles className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{t('noResultsFound')}</h3>
      <p className="text-muted-foreground max-w-sm mb-4">
        {t('noResultsFor', { type: viewMode === 'services' ? t('services').toLowerCase() : t('professionals').toLowerCase() })} "{searchTerm}"
      </p>
      <Button variant="outline" onClick={onClearSearch}>
        {t('clearFiltersSearch')}
      </Button>
    </div>
  );
};
