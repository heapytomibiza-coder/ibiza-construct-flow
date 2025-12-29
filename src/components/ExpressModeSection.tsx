import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Zap } from 'lucide-react';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { PRESET_KEYS, PRESET_SERVICE_MAP } from '@/lib/expressPresets';

const ExpressModeSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('home');
  const jobWizardEnabled = useFeature('ff.jobWizardV2');

  // Get presets from translations with stable service mapping
  const getExpressPresets = () => {
    return PRESET_KEYS.map(key => {
      const preset = t(`expressMode.presets.${key}`, { returnObjects: true }) as {
        title: string;
        category: string;
        icon: string;
        time: string;
        price: string;
      };
      
      // Use stable mapping for navigation (language-proof)
      const serviceMapping = PRESET_SERVICE_MAP[key];
      
      return {
        key,
        title: preset.title,
        category: serviceMapping.category,
        icon: preset.icon,
        estimatedTime: preset.time,
        estimatedPrice: preset.price
      };
    });
  };

  const expressPresets = getExpressPresets();

  const handleExpressClick = (preset: ReturnType<typeof getExpressPresets>[0]) => {
    if (jobWizardEnabled) {
      // Use preset key for navigation (stable across languages)
      navigate(`/post?category=${encodeURIComponent(preset.category)}&preset=${encodeURIComponent(preset.key)}&express=true`);
    }
  };

  if (!jobWizardEnabled) return null;

  return (
    <section className="py-16 bg-gradient-premium">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-white font-medium">{t('expressMode.badge')}</span>
          </div>
          
          <h2 className="text-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('expressMode.title')}
          </h2>
          
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {t('expressMode.description')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {
              expressPresets.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => handleExpressClick(preset)}
                  className="bg-white rounded-xl p-6 text-left hover:scale-105 transition-transform shadow-card hover:shadow-luxury group"
                >
                  <div className="text-3xl mb-3">{preset.icon}</div>
                  <h3 className="font-semibold text-charcoal mb-2">{preset.title}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{preset.estimatedTime}</span>
                    </div>
                    <div className="text-sm font-medium text-copper">
                      {preset.estimatedPrice}
                    </div>
                  </div>
                </button>
              ))
            }
          </div>

          <div className="mt-8">
            <p className="text-white/60 text-sm">
              {t('expressMode.footer')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpressModeSection;
