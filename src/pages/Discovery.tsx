import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UnifiedSearchBar } from '@/components/discovery/UnifiedSearchBar';
import { DiscoveryServiceCard } from '@/components/discovery/DiscoveryServiceCard';
import { BookingCart } from '@/components/discovery/BookingCart';
import { GlobalAIChatBot } from '@/components/layout/GlobalAIChatBot';
import { useDiscoveryServices } from '@/hooks/useDiscoveryServices';
import { useDiscoveryAnalytics } from '@/hooks/useDiscoveryAnalytics';
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';
import { ServiceConfigurator } from '@/components/services/ServiceConfigurator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const Discovery = () => {
  const { t } = useTranslation('services');
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedServiceItem, setSelectedServiceItem] = useState<any>(null);
  const [configuratorOpen, setConfiguratorOpen] = useState(false);
  
  const { services, loading } = useDiscoveryServices(selectedCategory, searchTerm);
  const { trackDiscoveryView, trackSearch, trackItemClick } = useDiscoveryAnalytics();

  // Track page view
  useEffect(() => {
    trackDiscoveryView('services', undefined);
  }, [trackDiscoveryView]);

  // Initialize from URL params
  useEffect(() => {
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    
    if (q) setSearchTerm(q);
    if (category) setSelectedCategory(category);
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value) trackSearch(value, 'services', services.length);
  };

  const handleServiceClick = (item: any) => {
    setSelectedServiceItem(item);
    setConfiguratorOpen(true);
    trackItemClick('service', item.id, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-dark to-copper bg-clip-text text-transparent">
            Find the Perfect Service
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our menu of professional services with transparent pricing and instant booking
          </p>
        </div>

        {/* Search Bar */}
        <UnifiedSearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onFilterToggle={() => {}}
          showFilters={false}
        />

        {/* AI Suggestions Banner */}
        {!searchTerm && (
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-copper/10 rounded-lg p-6 border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Popular Services</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Start with these commonly requested services
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('electrical')}
              >
                ⚡ Electrical Work
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('plumbing')}
              >
                🔧 Plumbing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('painting')}
              >
                🎨 Painting
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('carpentry')}
              >
                🪚 Carpentry
              </Button>
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

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonLoader key={i} variant="card" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchTerm
                ? `No services found for "${searchTerm}"`
                : 'No services available'}
            </p>
            <Button
              variant="link"
              onClick={() => setSearchTerm('')}
              className="mt-4"
            >
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
        )}
      </main>

      <Footer />

      {/* Floating AI Chat */}
      <GlobalAIChatBot />

      {/* Floating Booking Cart */}
      <BookingCart />

      {/* Service Configurator Modal */}
      <Dialog open={configuratorOpen} onOpenChange={setConfiguratorOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Your Service</DialogTitle>
          </DialogHeader>
          {selectedServiceItem && (
            <ServiceConfigurator
              service={{
                id: selectedServiceItem.service_id,
                name: selectedServiceItem.name,
                description: selectedServiceItem.description,
                category: selectedServiceItem.category,
              }}
              professionalId={selectedServiceItem.professional_id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discovery;
