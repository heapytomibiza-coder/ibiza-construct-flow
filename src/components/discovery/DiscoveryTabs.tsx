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
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-background border border-border">
          <TabsTrigger 
            value="services" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">{t('categories.all', 'Services')}</span>
            <span className="sm:hidden">Services</span>
          </TabsTrigger>
          <TabsTrigger 
            value="professionals"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Professionals</span>
            <span className="sm:hidden">Pros</span>
          </TabsTrigger>
          <TabsTrigger 
            value="both"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline">Both</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};