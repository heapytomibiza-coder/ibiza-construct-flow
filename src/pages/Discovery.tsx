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
import { useDiscoveryAnalytics } from '@/hooks/useDiscoveryAnalytics';
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Store, Users } from 'lucide-react';

const Discovery = () => {
  const { t } = useTranslation('services');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [viewMode, setViewMode] = useState<'services' | 'professionals'>('services');
  
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
          professionals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No professionals found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => navigate(`/professional/${prof.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {prof.name[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {prof.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {prof.servicesCount} service{prof.servicesCount !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      View Menu
                    </Button>
                  </div>
                </div>
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
