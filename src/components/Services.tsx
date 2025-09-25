import React from 'react';
import { Wrench, Home, Zap, Paintbrush, Hammer, Droplets, Thermometer, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { useServices } from '@/contexts/ServicesContext';

const Services = React.memo(() => {
  const navigate = useNavigate();
  const { t } = useTranslation('components');
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

  const services = React.useMemo(() => 
    getServiceCards().map(service => ({
      ...service,
      icon: iconMap[service.icon as keyof typeof iconMap] || Wrench
    })), [getServiceCards]
  );

  const handleServiceClick = React.useCallback((service: any) => {
    if (jobWizardEnabled) {
      navigate(`/post?category=${encodeURIComponent(service.category)}`);
    } else {
      navigate(`/service/${service.slug}`);
    }
  }, [jobWizardEnabled, navigate]);

  const handleGetQuoteClick = React.useCallback(() => {
    if (jobWizardEnabled) {
      navigate('/post');
    }
  }, [jobWizardEnabled, navigate]);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-display text-4xl md:text-5xl font-bold text-charcoal mb-6">
            {t('services.title')}<br />
            <span className="text-copper">{t('services.titleHighlight')}</span>
          </h2>
          <p className="text-body text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="card-luxury animate-pulse">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-hero/20 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gradient-hero/20 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gradient-hero/20 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gradient-hero/20 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : (
            services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="card-luxury hover:scale-105 group cursor-pointer relative"
                  onClick={() => handleServiceClick(service)}
                >
                  {service.popular && (
                    <div className="absolute -top-3 -right-3 bg-gradient-hero text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {t('services.popular')}
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-display font-semibold text-charcoal mb-2 text-lg">
                      {service.title}
                    </h3>
                    
                    <p className="text-body text-muted-foreground text-sm mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="mt-auto">
                      <span className="text-copper font-semibold text-sm">
                        {service.priceRange}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="btn-hero" onClick={handleGetQuoteClick}>
            {t('services.ctaButton')}
          </button>
          <p className="text-body text-muted-foreground mt-4">
            {t('services.ctaSubtext')}
          </p>
        </div>
      </div>
    </section>
  );
});

Services.displayName = 'Services';

export default Services;