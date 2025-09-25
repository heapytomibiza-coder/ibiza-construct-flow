import React from 'react';
import { Shield, Clock, Calculator, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BenefitsStrip = React.memo(() => {
  const { t } = useTranslation('components');
  
  const benefits = [
    {
      icon: Shield,
      title: t('benefits.fastTrustedHelp.title'),
      description: t('benefits.fastTrustedHelp.description')
    },
    {
      icon: Clock,
      title: t('benefits.protectedPayments.title'),
      description: t('benefits.protectedPayments.description')
    },
    {
      icon: Calculator,
      title: t('benefits.clearPricing.title'),
      description: t('benefits.clearPricing.description')
    },
    {
      icon: MapPin,
      title: t('benefits.localExperts.title'),
      description: t('benefits.localExperts.description')
    }
  ];

  return (
    <section className="py-16 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                className="flex items-center space-x-4 md:flex-col md:text-center md:space-x-0 md:space-y-4"
              >
                <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <h3 className="text-display font-semibold text-charcoal mb-1 text-lg">
                    {benefit.title}
                  </h3>
                  <p className="text-body text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

BenefitsStrip.displayName = 'BenefitsStrip';

export default BenefitsStrip;