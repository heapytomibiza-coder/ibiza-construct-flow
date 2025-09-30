import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DiscoveryTabs } from '@/components/discovery/DiscoveryTabs';
import { UnifiedSearchBar } from '@/components/discovery/UnifiedSearchBar';
import { HybridResultsGrid } from '@/components/discovery/HybridResultsGrid';
import { LocationBasedDiscovery } from '@/components/discovery/LocationBasedDiscovery';
import { CrossPollination } from '@/components/discovery/CrossPollination';
import { SmartSuggestions } from '@/components/discovery/SmartSuggestions';
import { EnhancedBookingFlow } from '@/components/discovery/EnhancedBookingFlow';
import { AIDiscoveryAssistant } from '@/components/discovery/AIDiscoveryAssistant';
import { AISmartRecommendations } from '@/components/discovery/AISmartRecommendations';
import { SmartLocationSuggestions } from '@/components/smart/SmartLocationSuggestions';
import { LocationAvailabilityTracker } from '@/components/discovery/LocationAvailabilityTracker';
import { TravelCostCalculator } from '@/components/discovery/TravelCostCalculator';
import { SeasonalInsights } from '@/components/discovery/SeasonalInsights';
import { useServicesRegistry } from '@/contexts/ServicesRegistry';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { useDiscoveryAnalytics } from '@/hooks/useDiscoveryAnalytics';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { CrossoverBanner } from '@/components/marketplace/CrossoverBanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type DiscoveryMode = 'services' | 'professionals' | 'both';

const Discovery = () => {
  const { t } = useTranslation('services');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const { context, updateContext, shouldShowCrossover } = useMarketplaceContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMode, setActiveMode] = useState<DiscoveryMode>('both');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingItem, setBookingItem] = useState<any>(null);
  const [bookingType, setBookingType] = useState<'service' | 'professional'>('service');
  const [selectedLocationData, setSelectedLocationData] = useState<any>(null);
  const [showCrossoverBanner, setShowCrossoverBanner] = useState(false);
  
  const { getServiceCards, loading: servicesLoading } = useServicesRegistry();
  const { professionals, loading: professionalsLoading } = useProfessionals();
  const { 
    trackDiscoveryView, 
    trackSearch, 
    trackModeSwitch, 
    trackItemClick,
    trackLocationUse,
    trackSuggestionClick 
  } = useDiscoveryAnalytics();
  
  const services = getServiceCards();
  const loading = servicesLoading || professionalsLoading;

  // Enhanced services with location data
  const enhancedServices = useMemo(() => {
    if (!userLocation) return services;
    
    return services.map(service => ({
      ...service,
      distance: Math.random() * 10 + 1 // Mock distance for demo
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [services, userLocation]);

  // Enhanced professionals with location data  
  const enhancedProfessionals = useMemo(() => {
    if (!userLocation) return professionals;
    
    return professionals.map(professional => ({
      ...professional,
      distance: Math.random() * 10 + 1 // Mock distance for demo
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [professionals, userLocation]);

  // Cross-pollination: Find professionals offering selected service
  const relatedProfessionals = useMemo(() => {
    if (!selectedService) return [];
    
    return enhancedProfessionals.filter(professional => {
      const specializations = professional.specializations || [];
      return specializations.some(spec => 
        spec.toLowerCase().includes(selectedService.category.toLowerCase()) ||
        spec.toLowerCase().includes(selectedService.title.toLowerCase())
      );
    });
  }, [selectedService, enhancedProfessionals]);

  // Cross-pollination: Find services offered by selected professional
  const relatedServices = useMemo(() => {
    if (!selectedProfessional) return [];
    
    const specializations = selectedProfessional.specializations || [];
    return enhancedServices.filter(service =>
      specializations.some(spec =>
        service.category.toLowerCase().includes(spec.toLowerCase()) ||
        service.title.toLowerCase().includes(spec.toLowerCase())
      )
    );
  }, [selectedProfessional, enhancedServices]);

  const handleServiceClick = (service: any, position?: number) => {
    trackItemClick('service', service.id, position || 0, searchTerm);
    setSelectedService(service);
    setSelectedProfessional(null);
    
    // Open booking modal instead of direct navigation
    setBookingItem(service);
    setBookingType('service');
    setBookingModalOpen(true);
  };

  const handleProfessionalClick = (professional: any, position?: number) => {
    trackItemClick('professional', professional.id, position || 0, searchTerm);
    setSelectedProfessional(professional);
    setSelectedService(null);
    
    // Open booking modal for professionals too
    setBookingItem(professional);
    setBookingType('professional');
    setBookingModalOpen(true);
  };

  const handleSuggestionClick = (suggestion: any) => {
    trackSuggestionClick('smart', suggestion.title);
    setSearchTerm(suggestion.title);
    setActiveMode('services');
  };

  const handleLocationChange = (location: { lat: number; lng: number; address: string } | null) => {
    setUserLocation(location);
    trackLocationUse(location ? 'enabled' : 'disabled', location?.address);
  };

  const handleLocationSelect = (locationData: any) => {
    setSelectedLocationData(locationData);
    // Convert to our expected location format
    if (locationData.coordinates) {
      setUserLocation({
        lat: locationData.coordinates.lat,
        lng: locationData.coordinates.lng,
        address: locationData.name
      });
      trackLocationUse('enabled', locationData.name);
    }
  };

  const handleModeChange = (newMode: DiscoveryMode) => {
    trackModeSwitch(activeMode, newMode);
    setActiveMode(newMode);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const resultsCount = enhancedServices.length + enhancedProfessionals.length;
      trackSearch(term, activeMode, resultsCount);
    }
  };

  // Initialize from URL params (from marketplace context)
  useEffect(() => {
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const urgency = searchParams.get('urgency');
    
    if (q) setSearchTerm(q);
    if (category) {
      // Set search term to category for filtering
      setSearchTerm(category);
    }
    if (location) {
      setUserLocation({
        lat: 0, lng: 0, // Will be geocoded
        address: location
      });
    }
    
    // Update context
    updateContext({
      searchTerm: q || category || '',
      category: category || undefined,
      location: location ? { lat: 0, lng: 0, address: location } : undefined,
      urgency: urgency as any,
      currentPath: 'browse'
    });
  }, [searchParams, updateContext]);

  // Track results for crossover logic
  useEffect(() => {
    const filteredServices = enhancedServices.filter(service =>
      !searchTerm || service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredProfessionals = enhancedProfessionals.filter(professional =>
      !searchTerm || professional.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.specializations?.some((spec: string) => 
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    const totalResults = filteredServices.length + filteredProfessionals.length;
    updateContext({ lastSearchResults: totalResults });
    
    // Show crossover banner if results are poor
    if (searchTerm && totalResults < 3 && shouldShowCrossover('discovery-to-post')) {
      setShowCrossoverBanner(true);
    }
  }, [enhancedServices, enhancedProfessionals, searchTerm, updateContext, shouldShowCrossover]);

  // Track initial page view
  React.useEffect(() => {
    trackDiscoveryView(activeMode, userLocation);
  }, [activeMode, userLocation, trackDiscoveryView]);

  const handleCrossoverToPost = () => {
    updateContext({ 
      previousPath: 'browse',
      crossoverCount: (context.crossoverCount || 0) + 1
    });
    
    const postUrl = `/post?${new URLSearchParams({
      ...(searchTerm && { service: searchTerm }),
      ...(context.category && { category: context.category }),
      ...(userLocation?.address && { location: userLocation.address })
    }).toString()}`;
    
    navigate(postUrl);
  };

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

        {/* AI Smart Recommendations */}
        <AISmartRecommendations
          searchTerm={searchTerm}
          location={userLocation}
          services={enhancedServices}
          professionals={enhancedProfessionals}
          onRecommendationClick={(item, type) => {
            if (type === 'service') {
              handleServiceClick(item);
            } else {
              handleProfessionalClick(item);
            }
          }}
        />

        {/* Location-based Discovery */}
        <LocationBasedDiscovery
          currentLocation={userLocation}
          onLocationChange={handleLocationChange}
        />

        {/* Smart Location Suggestions */}
        <SmartLocationSuggestions
          selectedService={selectedService?.category || searchTerm}
          onLocationSelect={handleLocationSelect}
          className="mb-6"
        />

        {/* Real-time Availability Tracking */}
        <LocationAvailabilityTracker
          location={userLocation}
          selectedService={selectedService?.category || searchTerm}
        />

        {/* Travel Cost Calculator */}
        <TravelCostCalculator
          location={userLocation}
          professionalLocations={enhancedProfessionals.slice(0, 5).map(prof => ({
            id: prof.id,
            name: prof.full_name || 'Anonymous Professional',
            distance: (prof as any).distance || Math.random() * 15 + 1,
            location: (prof as any).location || 'Unknown Location'
          }))}
        />

        {/* Seasonal Insights */}
        <SeasonalInsights
          location={userLocation}
          selectedService={selectedService?.category || searchTerm}
        />

        {/* Smart Suggestions */}
        {!searchTerm && (
          <SmartSuggestions
            searchTerm={searchTerm}
            location={userLocation}
            onSuggestionClick={handleSuggestionClick}
          />
        )}

        {/* Crossover Banner */}
        {showCrossoverBanner && (
          <CrossoverBanner
            type="discovery-to-post"
            context={{
              searchTerm,
              location: userLocation?.address,
              resultsCount: context.lastSearchResults || 0
            }}
            onCrossover={handleCrossoverToPost}
            onDismiss={() => setShowCrossoverBanner(false)}
          />
        )}

        {/* Unified Search */}
        <UnifiedSearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onFilterToggle={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />

        {/* Discovery Tabs */}
        <DiscoveryTabs
          activeMode={activeMode}
          onModeChange={handleModeChange}
          className="mb-8"
        />

        {/* Cross-pollination: Professionals for selected service */}
        <CrossPollination
          type="service"
          selectedItem={selectedService}
          relatedItems={relatedProfessionals}
          onItemClick={handleProfessionalClick}
        />

        {/* Cross-pollination: Services by selected professional */}
        <CrossPollination
          type="professional"
          selectedItem={selectedProfessional}
          relatedItems={relatedServices}
          onItemClick={handleServiceClick}
        />

        {/* Results Grid */}
        <HybridResultsGrid
          mode={activeMode}
          searchTerm={searchTerm}
          services={enhancedServices}
          professionals={enhancedProfessionals}
          loading={loading}
          showFilters={showFilters}
        />
      </main>

      <Footer />

      {/* AI Discovery Assistant */}
      <AIDiscoveryAssistant
        searchTerm={searchTerm}
        location={userLocation}
        onSuggestionClick={handleSuggestionClick}
        onServiceRecommendation={(service) => {
          // Add recommended service to enhanced services for display
          console.log('AI recommended service:', service);
        }}
      />

      {/* Enhanced Booking Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
          </DialogHeader>
          {bookingItem && (
            <EnhancedBookingFlow
              type={bookingType}
              item={bookingItem}
              onClose={() => setBookingModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discovery;