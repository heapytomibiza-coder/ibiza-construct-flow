import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UnifiedSearchBar } from '@/components/discovery/UnifiedSearchBar';
import { DiscoveryServiceCard } from '@/components/discovery/DiscoveryServiceCard';
import { BookingCart } from '@/components/discovery/BookingCart';
import { GlobalAIChatBot } from '@/components/layout/GlobalAIChatBot';
import { useDiscoveryServices } from '@/hooks/useDiscoveryServices';
import { useDiscoveryProfessionals } from '@/hooks/useDiscoveryProfessionals';
import { useDiscoveryAnalytics } from '@/hooks/useDiscoveryAnalytics';
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Store, Users } from 'lucide-react';
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
      
      <main className="container mx-auto px-4 pt-32 pb-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-dark to-copper bg-clip-text text-transparent">
            Find What You Need, Your Way
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Know your exact job? Browse specific services. Exploring options? Browse by professional trade.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
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
            <Badge className="absolute -top-2 right-12 z-10" variant="default">
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

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Browse Services
            </TabsTrigger>
            <TabsTrigger value="professionals" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Browse Professionals
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Contextual Suggestions */}
        {!searchTerm && (
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-copper/10 rounded-lg p-6 border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">
                {viewMode === 'services' 
                  ? t('discovery.services.popularTitle', 'Popular Services')
                  : t('discovery.professionals.popularTitle', 'Popular Trades')}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {viewMode === 'services' 
                ? t('discovery.services.popularSubtitle', 'Browse our most requested specific services')
                : t('discovery.professionals.popularSubtitle', 'Find professionals by their main trade or specialty')}
            </p>
            <div className="flex flex-wrap gap-2">
              {viewMode === 'services' ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('sink repair')}>
                    🚰 Sink Repair
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('outlet installation')}>
                    🔌 Outlet Installation
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('room painting')}>
                    🎨 Room Painting
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('door hanging')}>
                    🚪 Door Hanging
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('fence building')}>
                    🪵 Fence Building
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('electrician')}>
                    ⚡ Electrician
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('plumber')}>
                    🔧 Plumber
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('carpenter')}>
                    🪚 Carpenter
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('painter')}>
                    🎨 Painter
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('landscaper')}>
                    🌿 Landscaper
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && services.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {services.length} service{services.length !== 1 ? 's' : ''} available
            </p>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonLoader key={i} variant="card" />
            ))}
          </div>
        ) : viewMode === 'services' ? (
          services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                {searchTerm ? `No services found for "${searchTerm}"` : 'No services available'}
              </p>
              <Button variant="link" onClick={() => setSearchTerm('')} className="mt-4">
                Clear search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <DiscoveryServiceCard
                  key={service.id}
                  item={service}
                  onViewDetails={() => handleServiceClick(service)}
                />
              ))}
            </div>
          )
        ) : (
          loadingPros ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonLoader key={i} variant="card" />
              ))}
            </div>
          ) : discoveredProfessionals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No professionals found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoveredProfessionals.map((prof) => (
                <EnhancedProfessionalCard
                  key={prof.id}
                  professional={prof}
                />
              ))}
            </div>
          )
        )}
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
