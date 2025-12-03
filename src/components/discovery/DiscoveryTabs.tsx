import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, Users, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type DiscoveryMode = 'services' | 'professionals' | 'both';

interface DiscoveryTabsProps {
  activeMode: DiscoveryMode;
  onModeChange: (mode: DiscoveryMode) => void;
  className?: string;
}

export const DiscoveryTabs = ({ activeMode, onModeChange, className }: DiscoveryTabsProps) => {
  const { t } = useTranslation('wizard');

  return (
    <div className={cn("sticky top-16 z-30 bg-background/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:static sm:bg-transparent sm:backdrop-blur-none border-b sm:border-0", className)}>
      <div className="flex justify-center">
        <Tabs value={activeMode} onValueChange={(value) => onModeChange(value as DiscoveryMode)}>
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-background border border-border p-1 shadow-sm">
            <TabsTrigger 
              value="services" 
              className="flex flex-col items-center justify-center gap-1 h-auto py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span className="font-semibold text-sm">{t('discovery.services')}</span>
              </div>
              <span className="text-[10px] text-muted-foreground data-[state=active]:text-primary-foreground/80 font-normal hidden sm:block">
                {t('discovery.servicesSubtitle')}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="professionals"
              className="flex flex-col items-center justify-center gap-1 h-auto py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-semibold text-sm">{t('discovery.professionals')}</span>
              </div>
              <span className="text-[10px] text-muted-foreground data-[state=active]:text-primary-foreground/80 font-normal hidden sm:block">
                {t('discovery.professionalsSubtitle')}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};