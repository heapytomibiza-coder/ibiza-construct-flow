import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UnifiedSearchBar } from '@/components/discovery/UnifiedSearchBar';
import { DiscoveryTabs } from '@/components/discovery/DiscoveryTabs';
import { MobileDiscoveryHero } from '@/components/discovery/MobileDiscoveryHero';
import { EmptyState } from '@/components/discovery/EmptyState';
import { PopularServicesSection } from '@/components/discovery/PopularServicesSection';
import { DiscoveryServiceCard } from '@/components/discovery/DiscoveryServiceCard';
import { BookingCart } from '@/components/discovery/BookingCart';
import { GlobalAIChatBot } from '@/components/layout/GlobalAIChatBot';
import { useDiscoveryServices } from '@/hooks/useDiscoveryServices';
import { useDiscoveryProfessionals } from '@/hooks/useDiscoveryProfessionals';
import { useDiscoveryAnalytics } from '@/hooks/useDiscoveryAnalytics';
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';
import EnhancedServiceFilters from '@/components/services/EnhancedServiceFilters';
import EnhancedProfessionalCard from '@/components/professionals/EnhancedProfessionalCard';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useServicesRegistry } from '@/contexts/ServicesRegistry';

interface Filters {
  selectedTaxonomy: {
    category: string;
    subcategory: string;
    micro: string;
  } | null;
  specialists: string[];
  priceRange: [number, number];
  availability: string[];
  location: string;
  verified?: boolean;
  minRating?: number;
}

const Discovery = () => {
  const { t } = useTranslation('services');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getCategories } = useServicesRegistry();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'services' | 'professionals'>('services');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    selectedTaxonomy: null,
    specialists: [],
    priceRange: [0, 10000],
    availability: [],
    location: '',
  });
  
  const { services, loading } = useDiscoveryServices(searchTerm, filters);
  const { professionals: discoveredProfessionals, loading: loadingPros } = useDiscoveryProfessionals(
    searchTerm, 
    {
      verified: filters.verified,
      location: filters.location,
      minRating: filters.minRating,
      priceRange: filters.priceRange,
      skills: filters.specialists
    }
  );
  const { trackDiscoveryView, trackSearch, trackItemClick } = useDiscoveryAnalytics();
  
  const categories = getCategories();

  // Track page view
  useEffect(() => {
    trackDiscoveryView('services', undefined);
  }, [trackDiscoveryView]);

  // Initialize from URL params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value) trackSearch(value, 'services', services.length);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.selectedTaxonomy) count++;
    if (filters.specialists.length > 0) count += filters.specialists.length;
    if (filters.availability.length > 0) count += filters.availability.length;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.location) count++;
    return count;
  };

  const handleServiceClick = (item: any) => {
    trackItemClick('service', item.id, 0);
    navigate(`/professional/${item.professional_id}`);
  };

  // Group services by professional for professionals view
  const professionalGroups = services.reduce((acc, service) => {
    const profId = service.professional_id;
    if (!acc[profId]) {
      acc[profId] = {
        id: profId,
        name: service.professional?.full_name || 'Professional',
        servicesCount: 0,
        services: [],
      };
    }
    acc[profId].servicesCount++;
    acc[profId].services.push(service);
    return acc;
  }, {} as Record<string, any>);

  const professionals = Object.values(professionalGroups);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-32 pb-8">
        {/* Mobile Hero */}
        <MobileDiscoveryHero viewMode={viewMode} />
        
        {/* Desktop Hero */}
        <div className="text-center space-y-3 sm:space-y-4 mb-8 hidden lg:block">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-dark to-copper bg-clip-text text-transparent">
            Find What You Need, Your Way
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Know your exact job? Browse specific services. Exploring options? Browse by professional trade.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mt-6 lg:mt-8">
          <UnifiedSearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onFilterToggle={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            placeholder={
              viewMode === 'services' 
                ? t('discovery.services.searchPlaceholder', "Search for 'sink repair', 'outlet installation'...")
                : t('discovery.professionals.searchPlaceholder', "Search for 'electrician', 'plumber', 'carpenter'...")
            }
          />
          {getActiveFilterCount() > 0 && (
            <Badge className="absolute -top-2 right-14 sm:right-16 z-10 animate-scale-in" variant="default">
              {getActiveFilterCount()}
            </Badge>
          )}
        </div>

        {/* Filter Sheet */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <EnhancedServiceFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              visible={showFilters}
            />
          </SheetContent>
        </Sheet>

        {/* View Mode Tabs - Now Sticky on Mobile */}
        <DiscoveryTabs
          activeMode={viewMode as any}
          onModeChange={(mode) => setViewMode(mode as any)}
          className="mt-4"
        />

        {/* Results Section */}
        <div className="mt-6 space-y-6">
          {/* Results Count */}
          {!loading && services.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {services.length} service{services.length !== 1 ? 's' : ''} available
              </p>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonLoader key={i} variant="card" />
              ))}
            </div>
          ) : viewMode === 'services' ? (
            services.length === 0 ? (
              <EmptyState
                type={searchTerm ? 'no-results' : 'no-search'}
                searchTerm={searchTerm}
                onClearSearch={() => setSearchTerm('')}
                viewMode="services"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <DiscoveryServiceCard
                      item={service}
                      onViewDetails={() => handleServiceClick(service)}
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            loadingPros ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonLoader key={i} variant="card" />
                ))}
              </div>
            ) : discoveredProfessionals.length === 0 ? (
              <EmptyState
                type={searchTerm ? 'no-results' : 'no-search'}
                searchTerm={searchTerm}
                onClearSearch={() => setSearchTerm('')}
                viewMode="professionals"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
                {discoveredProfessionals.map((prof, index) => (
                  <div
                    key={prof.id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <EnhancedProfessionalCard
                      professional={prof}
                    />
                  </div>
                ))}
              </div>
            )
          )}

          {/* Popular Services - Below Results */}
          {!searchTerm && !loading && (
            <div className="mt-8">
              <PopularServicesSection
                viewMode={viewMode}
                onSelectSuggestion={(term) => setSearchTerm(term)}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Floating AI Chat */}
      <GlobalAIChatBot />

      {/* Floating Booking Cart */}
      <BookingCart />
    </div>
  );
};

export default Discovery;
