import { Shield, Award, Clock, Star, Users, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import professionalImage from '@/assets/professional-network.jpg';

const ProfessionalNetwork = () => {
  const { t } = useTranslation('components');

  const stats = [
    { icon: Users, number: "500+", label: t('professionalNetwork.stats.professionals') },
    { icon: Briefcase, number: "2,000+", label: t('professionalNetwork.stats.projects') },  
    { icon: Star, number: "4.9/5", label: t('professionalNetwork.stats.rating') },
    { icon: Shield, number: "100%", label: t('professionalNetwork.stats.protection') }
  ];

  const benefits = [
    {
      icon: Shield,
      title: t('professionalNetwork.benefits.verified.title'),
      description: t('professionalNetwork.benefits.verified.description')
    },
    {
      icon: Award,
      title: t('professionalNetwork.benefits.excellence.title'), 
      description: t('professionalNetwork.benefits.excellence.description')
    },
    {
      icon: Clock,
      title: t('professionalNetwork.benefits.rapid.title'),
      description: t('professionalNetwork.benefits.rapid.description')
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-display text-4xl md:text-5xl font-bold text-charcoal mb-6">
              {t('professionalNetwork.title')}
              <br />
              <span className="text-copper">{t('professionalNetwork.titleHighlight')}</span>
            </h2>
            
            <p className="text-body text-xl text-muted-foreground mb-8 leading-relaxed">
              {t('professionalNetwork.subtitle')}
            </p>

            {/* Benefits */}
            <div className="space-y-6 mb-10">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-display font-semibold text-charcoal mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-body text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-hero">
                {t('professionalNetwork.buttons.findProfessionals')}
              </button>
              <button className="btn-secondary">
                {t('professionalNetwork.buttons.joinNetwork')}
              </button>
            </div>
          </div>

          {/* Image & Stats */}
          <div className="relative">
            <div 
              className="rounded-2xl overflow-hidden shadow-elegant h-96 bg-cover bg-center"
              style={{ backgroundImage: `url(${professionalImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent"></div>
            </div>

            {/* Stats Overlay */}
            <div className="absolute -bottom-8 -left-8 right-8 bg-white rounded-xl shadow-luxury p-6">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <IconComponent className="w-5 h-5 text-copper mr-2" />
                        <span className="text-display font-bold text-2xl text-charcoal">
                          {stat.number}
                        </span>
                      </div>
                      <p className="text-body text-sm text-muted-foreground">
                        {stat.label}
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
            {[
              "Handyman", "Electrician", "Plumber", "Painter", 
              "Builder", "Architect", "Designer", "HVAC Tech",
              "Pool Expert", "Landscaper", "Roofer", "Carpenter"
            ].map((category, index) => (
              <div 
                key={index}
                className="bg-sand-light/50 rounded-lg p-4 text-center hover:bg-sand-light transition-all duration-300 cursor-pointer"
              >
                <span className="text-body font-medium text-charcoal text-sm">
                  {category}
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