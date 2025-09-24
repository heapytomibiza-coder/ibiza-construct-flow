import React from 'react';
import { Shield, Clock, Calculator, MapPin } from 'lucide-react';

const BenefitsStrip = React.memo(() => {
  const benefits = [
    {
      icon: Shield,
      title: 'Fast, trusted help',
      description: 'Vetted pros, right when you need them'
    },
    {
      icon: Clock,
      title: 'Protected payments',
      description: 'Escrow release only when you\'re happy'
    },
    {
      icon: Calculator,
      title: 'Clear pricing',
      description: 'Menus and estimates upfront'
    },
    {
      icon: MapPin,
      title: 'Local experts',
      description: 'Rated by Ibiza clients like you'
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