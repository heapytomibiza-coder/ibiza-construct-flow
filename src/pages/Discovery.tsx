import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DiscoveryTabs } from '@/components/discovery/DiscoveryTabs';
import { UnifiedSearchBar } from '@/components/discovery/UnifiedSearchBar';
import { HybridResultsGrid } from '@/components/discovery/HybridResultsGrid';
import { useServices } from '@/hooks/useServices';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useIsMobile } from '@/hooks/use-mobile';

export type DiscoveryMode = 'services' | 'professionals' | 'both';

const Discovery = () => {
  const { t } = useTranslation('services');
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMode, setActiveMode] = useState<DiscoveryMode>('both');
  const [showFilters, setShowFilters] = useState(false);
  
  const { getServiceCards, loading: servicesLoading } = useServices();
  const { professionals, loading: professionalsLoading } = useProfessionals();
  
  const services = getServiceCards();
  const loading = servicesLoading || professionalsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-dark to-copper bg-clip-text text-transparent">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Unified Search */}
        <UnifiedSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFilterToggle={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />

        {/* Discovery Tabs */}
        <DiscoveryTabs
          activeMode={activeMode}
          onModeChange={setActiveMode}
          className="mb-8"
        />

        {/* Results Grid */}
        <HybridResultsGrid
          mode={activeMode}
          searchTerm={searchTerm}
          services={services}
          professionals={professionals}
          loading={loading}
          showFilters={showFilters}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Discovery;