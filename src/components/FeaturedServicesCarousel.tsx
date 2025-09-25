import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { useServices } from '@/hooks/useServices';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { Wrench, Home, Zap, Paintbrush, Hammer, Droplets, Thermometer, Car, ArrowRight } from 'lucide-react';

const FeaturedServicesCarousel = React.memo(() => {
  const { t } = useTranslation('components');
  const navigate = useNavigate();
  const { getServiceCards, loading } = useServices();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');

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

  const featuredServices = React.useMemo(() => 
    getServiceCards().slice(0, 4).map(service => ({
      ...service,
      icon: iconMap[service.icon as keyof typeof iconMap] || Wrench
    })), 
    [getServiceCards]
  );

  const handleServiceClick = React.useCallback((service: any) => {
    // Track analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'carousel_interacted', {
        service_category: service.category,
        service_name: service.title
      });
    }

    if (jobWizardEnabled) {
      navigate(`/post?category=${encodeURIComponent(service.category)}&preset=${encodeURIComponent(service.title)}`);
    } else {
      navigate(`/service/${service.slug}`);
    }
  }, [jobWizardEnabled, navigate]);

  const handleViewAllServices = React.useCallback(() => {
    // Track analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'view_all_services', {
        source: 'featured_carousel'
      });
    }
    navigate('/services');
  }, [navigate]);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-display text-3xl md:text-4xl font-bold text-charcoal mb-4">
              {t('featuredServices.title')}
            </h2>
            <p className="text-body text-lg text-muted-foreground">
              {t('featuredServices.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card-luxury animate-pulse">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-hero/20 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gradient-hero/20 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gradient-hero/20 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gradient-hero/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background" data-tour="featured-services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-display text-3xl md:text-4xl font-bold text-charcoal mb-4">
            {t('featuredServices.title')}
          </h2>
          <p className="text-body text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('featuredServices.subtitle')}
          </p>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          <Carousel className="w-full">
            <CarouselContent className="-ml-1">
              {featuredServices.map((service, index) => (
                <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div 
                      className="card-luxury p-6 cursor-pointer hover:shadow-lg transition-all group"
                      onClick={() => handleServiceClick(service)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <service.icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-xl font-semibold text-charcoal mb-2 group-hover:text-copper transition-colors">
                          {service.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          {service.popular && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                              {t('featuredServices.popular')}
                            </Badge>
                          )}
                          <span className="text-copper font-semibold">
                            {service.priceRange}
                          </span>
                        </div>
                        
                        <div className="w-full">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full group-hover:bg-gradient-hero group-hover:text-white group-hover:border-transparent transition-all"
                          >
                            {t('featuredServices.viewService')}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        
        <div className="text-center mt-12">
          <Button 
            onClick={handleViewAllServices}
            size="lg"
            className="bg-gradient-hero text-white hover:shadow-lg transition-all"
          >
            {t('featuredServices.viewAllServices')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
});

FeaturedServicesCarousel.displayName = 'FeaturedServicesCarousel';

export default FeaturedServicesCarousel;