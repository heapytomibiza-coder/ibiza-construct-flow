import { useTranslation } from 'react-i18next';
import { Shield, Award, Clock, Star, Users, Briefcase, LucideIcon } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import professionalImage from '@/assets/professional-network.jpg';

// Keys for stats, benefits, and categories
const STAT_KEYS = ['verifiedPros', 'projects', 'rating', 'safepay'] as const;
const BENEFIT_KEYS = ['verified', 'guaranteed', 'rapid'] as const;
const CATEGORY_KEYS = [
  'handyman', 'electrician', 'plumber', 'painter',
  'builder', 'architect', 'designer', 'hvac',
  'pool', 'landscaper', 'roofer', 'carpenter'
] as const;

// Icon mappings
const STAT_ICONS: Record<typeof STAT_KEYS[number], LucideIcon> = {
  verifiedPros: Users,
  projects: Briefcase,
  rating: Star,
  safepay: Shield,
};

const BENEFIT_ICONS: Record<typeof BENEFIT_KEYS[number], LucideIcon> = {
  verified: Shield,
  guaranteed: Award,
  rapid: Clock,
};

const ProfessionalNetwork = () => {
  const { t } = useTranslation('home');

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-display text-4xl md:text-5xl font-bold text-charcoal mb-6">
              {t('professionalNetwork.title')}<br />
              <span className="text-copper">{t('professionalNetwork.titleHighlight')}</span>
            </h2>
            
            <p className="text-body text-xl text-muted-foreground mb-8 leading-relaxed">
              {t('professionalNetwork.description')}
            </p>

            {/* Benefits */}
            <div className="space-y-6 mb-10">
              {BENEFIT_KEYS.map((benefitKey) => {
                const IconComponent = BENEFIT_ICONS[benefitKey];
                return (
                  <div key={benefitKey} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-display font-semibold text-charcoal mb-2">
                        {t(`professionalNetwork.benefits.${benefitKey}.title`)}
                      </h3>
                      <p className="text-body text-muted-foreground leading-relaxed">
                        {t(`professionalNetwork.benefits.${benefitKey}.description`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-hero">
                {t('professionalNetwork.cta.findPros')}
              </button>
              <button className="btn-secondary">
                {t('professionalNetwork.cta.joinNetwork')}
              </button>
            </div>
          </div>

          {/* Image & Stats */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-elegant h-96 relative">
              <OptimizedImage
                src={professionalImage}
                alt="Professional network of verified builders and contractors in Ibiza"
                className="w-full h-full object-cover"
                width={800}
                height={600}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent"></div>
            </div>

            {/* Stats Overlay */}
            <div className="absolute -bottom-8 -left-8 right-8 bg-white rounded-xl shadow-luxury p-6">
              <div className="grid grid-cols-2 gap-6">
                {STAT_KEYS.map((statKey) => {
                  const IconComponent = STAT_ICONS[statKey];
                  return (
                    <div key={statKey} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <IconComponent className="w-5 h-5 text-copper mr-2" />
                        <span className="text-display font-bold text-2xl text-charcoal">
                          {t(`professionalNetwork.stats.${statKey}.number`)}
                        </span>
                      </div>
                      <p className="text-body text-sm text-muted-foreground">
                        {t(`professionalNetwork.stats.${statKey}.label`)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Categories */}
        <div className="mt-24">
          <h3 className="text-display text-3xl font-semibold text-charcoal text-center mb-12">
            {t('professionalNetwork.categoriesTitle')}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {CATEGORY_KEYS.map((categoryKey) => (
              <div 
                key={categoryKey}
                className="bg-sand-light/50 rounded-lg p-4 text-center hover:bg-sand-light transition-all duration-300 cursor-pointer"
              >
                <span className="text-body font-medium text-charcoal text-sm">
                  {t(`professionalNetwork.categories.${categoryKey}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalNetwork;
