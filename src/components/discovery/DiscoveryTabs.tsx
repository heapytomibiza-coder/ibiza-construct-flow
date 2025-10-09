import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, Users, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DiscoveryMode = 'services' | 'professionals' | 'both';

interface DiscoveryTabsProps {
  activeMode: DiscoveryMode;
  onModeChange: (mode: DiscoveryMode) => void;
  className?: string;
}

export const DiscoveryTabs = ({ activeMode, onModeChange, className }: DiscoveryTabsProps) => {
  const { t } = useTranslation('services');

  return (
    <div className={cn("flex justify-center", className)}>
      <Tabs value={activeMode} onValueChange={(value) => onModeChange(value as DiscoveryMode)}>
        <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-background border border-border">
          <TabsTrigger 
            value="services" 
            className="flex flex-col items-start gap-1 h-auto py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span className="font-semibold">{t('discovery.services.title', 'Browse Services')}</span>
            </div>
            <span className="text-xs text-muted-foreground font-normal hidden sm:block">
              {t('discovery.services.subtitle', 'Know your job? Find specific services')}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="professionals"
            className="flex flex-col items-start gap-1 h-auto py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{t('discovery.professionals.title', 'Browse Professionals')}</span>
            </div>
            <span className="text-xs text-muted-foreground font-normal hidden sm:block">
              {t('discovery.professionals.subtitle', 'Explore by trade or expertise')}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="both"
            className="flex flex-col items-start gap-1 h-auto py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              <span className="font-semibold hidden sm:inline">Both</span>
              <span className="font-semibold sm:hidden">All</span>
            </div>
            <span className="text-xs text-muted-foreground font-normal hidden sm:block">
              See everything
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};