import { useTranslation } from 'react-i18next';
import { Shield, CheckCircle, Star, MapPin } from 'lucide-react';

const ValuePropsSection = () => {
  const { t } = useTranslation('home');

  const valueProps = [
    {
      icon: CheckCircle,
      text: t('valueProps.verified', 'Verified Ibiza professionals'),
    },
    {
      icon: Shield,
      text: t('valueProps.secure', 'Secure escrow-style payments'),
    },
    {
      icon: Star,
      text: t('valueProps.transparent', 'Transparent reviews & portfolios'),
    },
    {
      icon: MapPin,
      text: t('valueProps.local', 'Built specifically for Ibiza property'),
    },
  ];

  return (
    <section className="py-12 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <div 
                key={index} 
                className="flex items-center gap-2 text-foreground"
              >
                <Icon className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm md:text-base font-medium">
                  {prop.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValuePropsSection;
