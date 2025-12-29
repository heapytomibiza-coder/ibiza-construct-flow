import { useTranslation } from 'react-i18next';
import { Search, MessageSquare, CheckCircle, LucideIcon } from 'lucide-react';

// Step keys that map to translations and icons
const STEP_KEYS = ['describe', 'match', 'work'] as const;
const STEP_NUMBERS = ['01', '02', '03'] as const;
const STEP_ICONS: Record<typeof STEP_KEYS[number], LucideIcon> = {
  describe: Search,
  match: MessageSquare,
  work: CheckCircle,
};

const HowItWorks = () => {
  const { t } = useTranslation('howItWorks');

  return (
    <section className="py-20 bg-sand-light/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-display text-4xl md:text-5xl font-bold text-charcoal mb-6">
            {t('title')}
          </h2>
          <p className="text-body text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {STEP_KEYS.map((stepKey, index) => {
              const IconComponent = STEP_ICONS[stepKey];
              const details = t(`steps.${stepKey}.details`, { returnObjects: true }) as string[];
              
              return (
                <div key={stepKey} className="relative">
                  {/* Connector Line */}
                  {index < STEP_KEYS.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-copper to-copper-light transform translate-x-6 z-0">
                      <div className="absolute right-0 top-1/2 transform translate-y-1/2 w-3 h-3 bg-copper rounded-full"></div>
                    </div>
                  )}

                  {/* Step Card */}
                  <div className="card-luxury text-center relative z-10">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center shadow-luxury">
                        <span className="text-white font-bold text-lg text-display">
                          {STEP_NUMBERS[index]}
                        </span>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="w-20 h-20 bg-sand-light rounded-2xl flex items-center justify-center mx-auto mb-6 mt-8">
                      <IconComponent className="w-10 h-10 text-copper" />
                    </div>

                    {/* Content */}
                    <h3 className="text-display font-semibold text-charcoal mb-4 text-xl">
                      {t(`steps.${stepKey}.title`)}
                    </h3>

                    <p className="text-body text-muted-foreground mb-6 leading-relaxed">
                      {t(`steps.${stepKey}.description`)}
                    </p>

                    {/* Details */}
                    <ul className="space-y-2">
                      {Array.isArray(details) && details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center justify-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-copper rounded-full"></div>
                          <span className="text-body text-sm text-charcoal">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-premium rounded-2xl p-8 shadow-elegant max-w-2xl mx-auto">
            <h3 className="text-display text-2xl font-semibold text-white mb-4">
              {t('cta.title')}
            </h3>
            <p className="text-white/90 mb-6">
              {t('cta.subtitle')}
            </p>
            <button className="btn-hero">
              {t('cta.button')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
