import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UnifiedSearchBar } from '@/components/discovery/UnifiedSearchBar';
import { DiscoveryTabs } from '@/components/discovery/DiscoveryTabs';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useServicesRegistry } from '@/contexts/ServicesRegistry';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      setFilters(prev => ({
        ...prev,
        selectedTaxonomy: {
          category,
          subcategory: '',
          micro: '',
        },
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        selectedTaxonomy: null,
      }));
    }
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
      
      <main className="pt-24 pb-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/5 to-background py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-3 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-copper bg-clip-text text-transparent">
                Find Your Perfect Professional
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Browse services or explore professionals. Filter to find exactly what you need.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center gap-3 mb-6">
              <Button
                variant={viewMode === 'services' ? 'default' : 'outline'}
                onClick={() => setViewMode('services')}
                className="gap-2"
              >
                🛠️ Services
              </Button>
              <Button
                variant={viewMode === 'professionals' ? 'default' : 'outline'}
                onClick={() => setViewMode('professionals')}
                className="gap-2"
              >
                👥 Professionals
              </Button>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <UnifiedSearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onFilterToggle={() => setShowFilters(!showFilters)}
                showFilters={showFilters}
                placeholder={
                  viewMode === 'services' 
                    ? "Search services like 'plumbing', 'electrical'..."
                    : "Search professionals like 'electrician', 'builder'..."
                }
              />
            </div>
          </div>
        </div>

        {/* Mobile Filter Sheet */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side="left" className="w-80 overflow-y-auto bg-background">
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <EnhancedServiceFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
                visible={true}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area with Sidebar */}
        <div className="container mx-auto px-4 mt-6">
          <div className="flex gap-6">
            {/* Left Sidebar - Desktop Only */}
            <aside className={`hidden lg:block transition-all duration-300 ${filtersCollapsed ? 'w-12' : 'w-80'} flex-shrink-0`}>
              <div className="sticky top-24 space-y-4">
                {/* Collapse Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                  className="w-full justify-between"
                >
                  {!filtersCollapsed && (
                    <>
                      <span className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {getActiveFilterCount() > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getActiveFilterCount()}
                          </Badge>
                        )}
                      </span>
                      <ChevronLeft className="h-4 w-4" />
                    </>
                  )}
                  {filtersCollapsed && <ChevronRight className="h-4 w-4 mx-auto" />}
                </Button>

                {/* Filters Content */}
                {!filtersCollapsed && (
                  <div className="bg-card border rounded-lg overflow-hidden">
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4">
                      <EnhancedServiceFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        categories={categories}
                        visible={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Results Header */}
              {!loading && !loadingPros && (services.length > 0 || discoveredProfessionals.length > 0) && (
                <div className="flex items-center justify-between bg-card p-4 rounded-lg border mb-6">
                  <div>
                    <p className="text-lg font-semibold">
                      {viewMode === 'services' 
                        ? `${services.length} ${services.length === 1 ? 'Service' : 'Services'}`
                        : `${discoveredProfessionals.length} ${discoveredProfessionals.length === 1 ? 'Professional' : 'Professionals'}`
                      }
                    </p>
                    {(searchTerm || getActiveFilterCount() > 0) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchTerm && `Searching for "${searchTerm}"`}
                        {getActiveFilterCount() > 0 && ` • ${getActiveFilterCount()} filter${getActiveFilterCount() > 1 ? 's' : ''} applied`}
                      </p>
                    )}
                  </div>
                  {getActiveFilterCount() > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFilters({
                        selectedTaxonomy: null,
                        specialists: [],
                        priceRange: [0, 10000],
                        availability: [],
                        location: '',
                      })}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}

              {/* Results Grid */}
              {viewMode === 'services' ? (
                loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <SkeletonLoader key={i} variant="card" />
                    ))}
                  </div>
                ) : services.length === 0 ? (
                  <EmptyState
                    type={searchTerm || selectedCategory ? 'no-results' : 'no-search'}
                    searchTerm={searchTerm || selectedCategory || ''}
                    onClearSearch={() => {
                      setSearchTerm('');
                      setSelectedCategory(null);
                      setFilters({
                        selectedTaxonomy: null,
                        specialists: [],
                        priceRange: [0, 10000],
                        availability: [],
                        location: '',
                      });
                    }}
                    viewMode="services"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                    {services.map((service, index) => (
                      <div
                        key={service.id}
                        className="animate-scale-in"
                        style={{ animationDelay: `${index * 30}ms` }}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <SkeletonLoader key={i} variant="card" />
                    ))}
                  </div>
                ) : discoveredProfessionals.length === 0 ? (
                  <EmptyState
                    type={searchTerm || selectedCategory ? 'no-results' : 'no-search'}
                    searchTerm={searchTerm || selectedCategory || ''}
                    onClearSearch={() => {
                      setSearchTerm('');
                      setSelectedCategory(null);
                      setFilters({
                        selectedTaxonomy: null,
                        specialists: [],
                        priceRange: [0, 10000],
                        availability: [],
                        location: '',
                      });
                    }}
                    viewMode="professionals"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                    {discoveredProfessionals.map((prof, index) => (
                      <div
                        key={prof.id}
                        className="animate-scale-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <EnhancedProfessionalCard
                          professional={prof}
                        />
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Popular Services */}
              {!loading && !loadingPros && services.length === 0 && discoveredProfessionals.length === 0 && !searchTerm && (
                <div className="mt-8">
                  <PopularServicesSection
                    viewMode={viewMode}
                    onSelectSuggestion={(term) => setSearchTerm(term)}
                  />
                </div>
              )}
            </div>
          </div>
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
