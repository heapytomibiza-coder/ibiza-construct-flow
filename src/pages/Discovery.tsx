import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DiscoveryTabs } from '@/components/discovery/DiscoveryTabs';
import { UnifiedSearchBar } from '@/components/discovery/UnifiedSearchBar';
import { HybridResultsGrid } from '@/components/discovery/HybridResultsGrid';
import { LocationBasedDiscovery } from '@/components/discovery/LocationBasedDiscovery';
import { CrossPollination } from '@/components/discovery/CrossPollination';
import { SmartSuggestions } from '@/components/discovery/SmartSuggestions';
import { EnhancedBookingFlow } from '@/components/discovery/EnhancedBookingFlow';
import { useServices } from '@/hooks/useServices';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { useDiscoveryAnalytics } from '@/hooks/useDiscoveryAnalytics';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type DiscoveryMode = 'services' | 'professionals' | 'both';

const Discovery = () => {
  const { t } = useTranslation('services');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMode, setActiveMode] = useState<DiscoveryMode>('both');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingItem, setBookingItem] = useState<any>(null);
  const [bookingType, setBookingType] = useState<'service' | 'professional'>('service');
  
  const { getServiceCards, loading: servicesLoading } = useServices();
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

  // Calculate distance for location-based sorting
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

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

  // Track initial page view
  React.useEffect(() => {
    trackDiscoveryView(activeMode, userLocation);
  }, [activeMode, userLocation, trackDiscoveryView]);

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

        {/* Location-based Discovery */}
        <LocationBasedDiscovery
          currentLocation={userLocation}
          onLocationChange={handleLocationChange}
        />

        {/* Smart Suggestions */}
        {!searchTerm && (
          <SmartSuggestions
            searchTerm={searchTerm}
            location={userLocation}
            onSuggestionClick={handleSuggestionClick}
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