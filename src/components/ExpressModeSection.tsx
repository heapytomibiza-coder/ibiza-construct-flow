import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Clock, Zap, Wrench } from 'lucide-react';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { useServicesRegistry } from '@/contexts/ServicesRegistry';

const ExpressModeSection: React.FC = () => {
  const { t } = useTranslation('components');
  const navigate = useNavigate();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const { services, loading } = useServicesRegistry();

  // Get popular express tasks from database
  const getExpressPresets = () => {
    const popularMicroServices = [
      { micro: 'Fix leaky tap', category: 'Plumbing', icon: '💧', time: 'Today', price: '€80-150' },
      { micro: 'Hang pictures', category: 'Handyman', icon: '🖼️', time: '2 hours', price: '€50-100' },
      { micro: 'Fix door lock', category: 'Handyman', icon: '🔒', time: '1 hour', price: '€60-120' },
      { micro: 'Install light fixture', category: 'Electrical', icon: '💡', time: '2-3 hours', price: '€100-200' },
    ];

    // Try to match with database services, fallback to presets
    return popularMicroServices.map(preset => {
      const dbService = services.find(s => 
        s.micro.toLowerCase().includes(preset.micro.toLowerCase().split(' ')[0]) ||
        s.micro.toLowerCase() === preset.micro.toLowerCase()
      );
      
      return {
        title: dbService?.micro || preset.micro,
        category: dbService?.category || preset.category,
        icon: preset.icon,
        estimatedTime: preset.time,
        estimatedPrice: preset.price
      };
    });
  };

  const expressPresets = getExpressPresets();

  const handleExpressClick = (preset: any) => {
    if (jobWizardEnabled) {
      navigate(`/post?category=${encodeURIComponent(preset.category)}&preset=${encodeURIComponent(preset.title)}&express=true`);
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
            {t('expressMode.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              // Loading skeleton for express presets
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="w-8 h-8 bg-gradient-hero/20 rounded mb-3"></div>
                  <div className="h-5 bg-gradient-hero/20 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gradient-hero/20 rounded w-1/2 mb-1"></div>
                  <div className="h-4 bg-gradient-hero/20 rounded w-2/3"></div>
                </div>
              ))
            ) : (
              expressPresets.map((preset, index) => (
                <button
                  key={index}
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
            )}
          </div>

          <div className="mt-8">
            <p className="text-white/60 text-sm">
              {t('expressMode.features')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpressModeSection;