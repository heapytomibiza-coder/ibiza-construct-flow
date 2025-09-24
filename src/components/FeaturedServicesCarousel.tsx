import React from 'react';
import { Wrench, Home, Zap, Paintbrush, Hammer, Droplets, Thermometer, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { useServices } from '@/contexts/ServicesContext';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const FeaturedServicesCarousel = React.memo(() => {
  const navigate = useNavigate();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const { getServiceCards, loading } = useServices();
  
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

  // Get featured services (first 4 for now, can be enhanced with is_featured field)
  const featuredServices = React.useMemo(() => 
    getServiceCards()
      .map(service => ({
        ...service,
        icon: iconMap[service.icon as keyof typeof iconMap] || Wrench
      }))
      .slice(0, 4), // Show only first 4 services
    [getServiceCards]
  );

  const handleServiceClick = React.useCallback((service: any) => {
    if (jobWizardEnabled) {
      navigate(`/post?category=${encodeURIComponent(service.category)}`);
    } else {
      navigate(`/service/${service.slug}`);
    }
  }, [jobWizardEnabled, navigate]);

  const handleViewAllServices = React.useCallback(() => {
    navigate('/services');
  }, [navigate]);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-display text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Featured Services
            </h2>
            <p className="text-body text-lg text-muted-foreground">
              Get started with our most popular services
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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-display text-3xl md:text-4xl font-bold text-charcoal mb-4">
            Featured Services
          </h2>
          <p className="text-body text-lg text-muted-foreground">
            Get started with our most popular services
          </p>
        </div>

        {/* Carousel for mobile and desktop */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredServices.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                    <div
                      className="card-luxury hover:scale-105 group cursor-pointer relative h-full"
                      onClick={() => handleServiceClick(service)}
                    >
                      {service.popular && (
                        <div className="absolute -top-3 -right-3 bg-gradient-hero text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Popular
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center h-full">
                        <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-display font-semibold text-charcoal mb-2 text-lg">
                          {service.title}
                        </h3>
                        
                        <p className="text-body text-muted-foreground text-sm mb-4 leading-relaxed flex-grow">
                          {service.description}
                        </p>
                        
                        <div className="mt-auto">
                          <span className="text-copper font-semibold text-sm">
                            {service.priceRange}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12" />
            <CarouselNext className="hidden md:flex -right-12" />
          </Carousel>
        </div>

        {/* View All Services CTA */}
        <div className="text-center mt-12">
          <Button 
            onClick={handleViewAllServices}
            variant="outline"
            size="lg"
            className="btn-secondary"
          >
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
});

FeaturedServicesCarousel.displayName = 'FeaturedServicesCarousel';

export default FeaturedServicesCarousel;