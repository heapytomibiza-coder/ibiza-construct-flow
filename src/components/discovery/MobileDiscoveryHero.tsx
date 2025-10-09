import React from 'react';
import { Sparkles } from 'lucide-react';

interface MobileDiscoveryHeroProps {
  viewMode: 'services' | 'professionals';
}

export const MobileDiscoveryHero = ({ viewMode }: MobileDiscoveryHeroProps) => {
  return (
    <div className="text-center space-y-2 lg:hidden">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">Find Your Pro</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-primary-dark to-copper bg-clip-text text-transparent px-4">
        {viewMode === 'services' ? 'Find Services' : 'Find Professionals'}
      </h1>
    </div>
  );
};
