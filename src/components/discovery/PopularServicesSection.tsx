import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface PopularServicesSectionProps {
  viewMode: 'services' | 'professionals';
  onSelectSuggestion: (term: string) => void;
}

export const PopularServicesSection = ({ viewMode, onSelectSuggestion }: PopularServicesSectionProps) => {
  const { t } = useTranslation('services');
  const [isExpanded, setIsExpanded] = useState(false);

  const servicesSuggestions = [
    { emoji: '🚰', label: 'Sink Repair', term: 'sink repair' },
    { emoji: '🔌', label: 'Outlet Installation', term: 'outlet installation' },
    { emoji: '🎨', label: 'Room Painting', term: 'room painting' },
    { emoji: '🚪', label: 'Door Hanging', term: 'door hanging' },
    { emoji: '🪵', label: 'Fence Building', term: 'fence building' },
  ];

  const professionalsSuggestions = [
    { emoji: '⚡', label: 'Electrician', term: 'electrician' },
    { emoji: '🔧', label: 'Plumber', term: 'plumber' },
    { emoji: '🪚', label: 'Carpenter', term: 'carpenter' },
    { emoji: '🎨', label: 'Painter', term: 'painter' },
    { emoji: '🌿', label: 'Landscaper', term: 'landscaper' },
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
            {viewMode === 'services' ? 'Popular Services' : 'Popular Trades'}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Desktop: Always Visible Header */}
      <div className="hidden lg:flex items-center gap-3 p-6 pb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">
          {viewMode === 'services' 
            ? t('discovery.services.popularTitle', 'Popular Services')
            : t('discovery.professionals.popularTitle', 'Popular Trades')}
        </h3>
      </div>

      {/* Content - Mobile: Collapsible, Desktop: Always Visible */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block px-4 pb-4 lg:px-6 lg:pb-6`}>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 hidden lg:block">
          {viewMode === 'services' 
            ? t('discovery.services.popularSubtitle', 'Browse our most requested specific services')
            : t('discovery.professionals.popularSubtitle', 'Find professionals by their main trade or specialty')}
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
              {item.label}
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
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
