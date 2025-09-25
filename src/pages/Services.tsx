import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wrench, Home, Zap, Paintbrush, Hammer, Droplets, Thermometer, Car } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ServiceSearch } from '@/components/services/ServiceSearch';
import EnhancedServiceFilters from '@/components/services/EnhancedServiceFilters';
import { EnhancedServiceCard } from '@/components/services/EnhancedServiceCard';
import { MobileFilterDrawer } from '@/components/mobile/MobileFilterDrawer';
import { MobileServiceCard } from '@/components/mobile/MobileServiceCard';
import { StickyMobileCTA } from '@/components/mobile/StickyMobileCTA';
import { useIsMobile } from '@/hooks/use-mobile';
import { ServicePackages } from '@/components/services/ServicePackages';
import { useServices } from '@/hooks/useServices';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { cn } from '@/lib/utils';

const Services = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('pages');
  const { getServiceCards, getCategories, loading } = useServices();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    subcategories: [],
    specialists: [],
    location: '',
    priceRange: [0, 100000] as [number, number],
    availability: []
  });

  const iconMap = {
    'Wrench': Wrench,
    'Home': Home,
    'Zap': Zap,
    'Paintbrush': Paintbrush,
    'Hammer': Hammer,
    'Droplets': Droplets,
    'Thermometer': Thermometer,
    'Car': Car
  };

  const services = getServiceCards().map(service => ({
    ...service,
    icon: iconMap[service.icon as keyof typeof iconMap] || Wrench,
    rating: 4.8 + Math.random() * 0.4, // Mock rating
    completedJobs: Math.floor(Math.random() * 500) + 50,
    responseTime: ['2h avg', '4h avg', '1 day', 'Same day'][Math.floor(Math.random() * 4)]
  }));

  // Filter services based on search and filters
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filters.categories.length === 0 || 
                           filters.categories.includes(service.category);
    
    const matchesSpecialist = filters.specialists.length === 0 ||
                             filters.specialists.some(specialist => 
                               service.category.toLowerCase().includes(specialist.toLowerCase()));
    
    return matchesSearch && matchesCategory && matchesSpecialist;
  });

  const handleServiceClick = (service: any) => {
    // Track analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'service_card_click', {
        category: service.category,
        service_name: service.title
      });
    }
    
    if (jobWizardEnabled) {
      // Pass more context to wizard for better pre-filling
      const wizardParams = new URLSearchParams({
        category: service.category,
        preset: service.title,
        source: 'services'
      });
      navigate(`/post?${wizardParams.toString()}`);
    } else {
      navigate(`/service/${service.slug}`);
    }
  };

  const handleBookNow = (service: any) => {
    // Track analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'service_book_now', {
        category: service.category,
        service_name: service.title,
        value: service.price
      });
    }
    
    if (jobWizardEnabled) {
      // Use calendar-first wizard for booking
      const wizardParams = new URLSearchParams({
        category: service.category,
        preset: service.title,
        calendar: 'true',
        source: 'booking'
      });
      navigate(`/post?${wizardParams.toString()}`);
    } else {
      navigate(`/service/${service.slug}?book=true`);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    if (jobWizardEnabled) {
      navigate(`/post?package=${packageId}`);
    }
  };

  // Sample packages for demonstration
  const samplePackages = [
    {
      id: 'basic',
      name: 'Basic',
      price: '€150',
      duration: '2-3 hours',
      description: 'Essential repairs and maintenance',
      features: [
        'Up to 3 small repairs',
        'Basic tools included',
        '24h response time',
        'Quality guarantee'
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '€350',
      duration: 'Half day',
      description: 'Comprehensive service package',
      popular: true,
      features: [
        'Up to 6 repairs/tasks',
        'Professional tools',
        'Same day service',
        'Photo documentation',
        '30-day warranty'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '€650',
      duration: 'Full day',
      description: 'Complete solution with extras',
      features: [
        'Unlimited small tasks',
        'Premium materials',
        'Priority booking',
        'Detailed report',
        '90-day warranty',
        'Follow-up service'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-card py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-display text-4xl md:text-6xl font-bold text-charcoal mb-6">
                {t('services.hero.title').split(t('services.hero.titleHighlight'))[0]}
                <span className="text-copper">{t('services.hero.titleHighlight')}</span>
                {t('services.hero.title').split(t('services.hero.titleHighlight'))[1]}
              </h1>
              <p className="text-body text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                {t('services.hero.subtitle')}
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto" data-tour="service-search">
              <ServiceSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onFilterToggle={() => setShowFilters(!showFilters)}
                showFilters={showFilters}
              />
            </div>
          </div>
        </section>

        {/* Specialized Categories Section */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-display text-3xl md:text-4xl font-bold text-charcoal mb-6">
                {t('services.specializedCategories.title')}
              </h2>
              <p className="text-body text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('services.specializedCategories.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Architects & Design */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">{t('services.specializedCategories.architectsDesign.title')}</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {(t('services.specializedCategories.architectsDesign.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              {/* Builders & Structural Works */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Hammer className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">{t('services.specializedCategories.buildersStructural.title')}</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {(t('services.specializedCategories.buildersStructural.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              {/* Floors, Doors & Windows */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">{t('services.specializedCategories.floorsDoorsWindows.title')}</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {(t('services.specializedCategories.floorsDoorsWindows.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              {/* Kitchen & Bathroom Fitter */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">{t('services.specializedCategories.kitchenBathroom.title')}</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {(t('services.specializedCategories.kitchenBathroom.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              {/* Design & Planning */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Paintbrush className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">{t('services.specializedCategories.designPlanning.title')}</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {(t('services.specializedCategories.designPlanning.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              {/* Commercial Projects */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">{t('services.specializedCategories.commercial.title')}</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {(t('services.specializedCategories.commercial.items', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Mobile Filter Button */}
            {isMobile && (
              <div className="mb-6">
                <MobileFilterDrawer
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={getCategories()}
                  isOpen={showFilters}
                  onOpenChange={setShowFilters}
                />
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop Filters Sidebar */}
              {!isMobile && (
                <div className="lg:w-80 flex-shrink-0" data-tour="service-filters">
                  <EnhancedServiceFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    categories={getCategories()}
                    visible={true}
                  />
                </div>
              )}

              {/* Services Grid */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-display text-xl md:text-2xl font-semibold text-charcoal">
                    {t('services.results.title')} ({filteredServices.length})
                  </h2>
                </div>

                {loading ? (
                  <div className={cn(
                    "grid gap-4",
                    isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  )}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="card-luxury animate-pulse">
                        <div className="h-48 bg-sand/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={cn(
                    "grid gap-4",
                    isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  )}>
                    {filteredServices.map((service, index) => (
                      isMobile ? (
                        <MobileServiceCard
                          key={index}
                          service={service}
                          onViewService={() => handleServiceClick(service)}
                          onBookNow={() => handleBookNow(service)}
                        />
                      ) : (
                        <EnhancedServiceCard
                          key={index}
                          service={service}
                          onViewService={() => handleServiceClick(service)}
                          onBookNow={() => handleBookNow(service)}
                        />
                      )
                    ))}
                  </div>
                )}

                {!loading && filteredServices.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      {t('services.results.noResults')}
                    </p>
                  </div>
                )}

                {/* Mobile spacing for sticky CTA */}
                {isMobile && (
                  <div className="h-20"></div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Service Packages Section */}
        <section className="py-16 bg-sand-light/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-display text-3xl md:text-4xl font-bold text-charcoal mb-6">
                {t('services.packages.title')}
              </h2>
              <p className="text-body text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('services.packages.subtitle')}
              </p>
            </div>
            
            <ServicePackages
              packages={samplePackages}
              onSelectPackage={handlePackageSelect}
            />
          </div>
        </section>
      </main>
      
      {/* Mobile Sticky CTA */}
      {isMobile && filteredServices.length > 0 && (
        <StickyMobileCTA
          primaryAction={{
            label: "Post Your Job",
            onClick: () => {
              if (jobWizardEnabled) {
                navigate('/post?calendar=true&source=services_cta');
              } else {
                navigate('/post');
              }
            }
          }}
          secondaryAction={{
            label: "Browse All",
            onClick: () => {
              setFilters({
                categories: [],
                subcategories: [],
                specialists: [],
                location: '',
                priceRange: [0, 100000],
                availability: []
              });
              setSearchTerm('');
            }
          }}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Services;