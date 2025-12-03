import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PopularServicesSectionProps {
  viewMode: 'services' | 'professionals';
  onSelectSuggestion: (term: string) => void;
}

export const PopularServicesSection = ({ viewMode, onSelectSuggestion }: PopularServicesSectionProps) => {
  const { t } = useTranslation('common');
  const [isExpanded, setIsExpanded] = useState(false);

  const servicesSuggestions = [
    { emoji: '🚰', labelKey: 'suggestions.sinkRepair', term: 'sink repair' },
    { emoji: '🔌', labelKey: 'suggestions.outletInstallation', term: 'outlet installation' },
    { emoji: '🎨', labelKey: 'suggestions.roomPainting', term: 'room painting' },
    { emoji: '🚪', labelKey: 'suggestions.doorHanging', term: 'door hanging' },
    { emoji: '🪵', labelKey: 'suggestions.fenceBuilding', term: 'fence building' },
  ];

  const professionalsSuggestions = [
    { emoji: '⚡', labelKey: 'suggestions.electrician', term: 'electrician' },
    { emoji: '🔧', labelKey: 'suggestions.plumber', term: 'plumber' },
    { emoji: '🪚', labelKey: 'suggestions.carpenter', term: 'carpenter' },
    { emoji: '🎨', labelKey: 'suggestions.painter', term: 'painter' },
    { emoji: '🌿', labelKey: 'suggestions.landscaper', term: 'landscaper' },
  ];

  const suggestions = viewMode === 'services' ? servicesSuggestions : professionalsSuggestions;

  return (
    <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-copper/10 rounded-xl border border-primary/20 overflow-hidden">
      {/* Mobile: Collapsible Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 lg:hidden hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">
            {viewMode === 'services' ? t('popularServices') : t('popularTrades')}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Desktop: Always Visible Header */}
      <div className="hidden lg:flex items-center gap-3 p-6 pb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">
          {viewMode === 'services' 
            ? t('popularServices')
            : t('popularTrades')}
        </h3>
      </div>

      {/* Content - Mobile: Collapsible, Desktop: Always Visible */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block px-4 pb-4 lg:px-6 lg:pb-6`}>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 hidden lg:block">
          {viewMode === 'services' 
            ? t('browsePopularServices')
            : t('browsePopularTrades')}
        </p>
        
        {/* Mobile: Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden scrollbar-hide snap-x snap-mandatory">
          {suggestions.map((item) => (
            <Button
              key={item.term}
              variant="outline"
              size="sm"
              onClick={() => onSelectSuggestion(item.term)}
              className="flex-shrink-0 snap-start bg-background/80 backdrop-blur"
            >
              <span className="mr-1.5">{item.emoji}</span>
              {t(item.labelKey)}
            </Button>
          ))}
        </div>

        {/* Desktop: Wrap */}
        <div className="hidden lg:flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <Button
              key={item.term}
              variant="outline"
              size="sm"
              onClick={() => onSelectSuggestion(item.term)}
            >
              <span className="mr-1.5">{item.emoji}</span>
              {t(item.labelKey)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
