import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Zap, Wrench } from 'lucide-react';
import { useFeature } from '@/hooks/useFeature';

const ExpressModeSection: React.FC = () => {
  const navigate = useNavigate();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');

  const expressPresets = [
    {
      title: "Fix Leaky Tap",
      category: "Plumbing",
      icon: "💧",
      estimatedTime: "Today",
      estimatedPrice: "€80-150"
    },
    {
      title: "Hang Pictures",
      category: "Handyman", 
      icon: "🖼️",
      estimatedTime: "2 hours",
      estimatedPrice: "€50-100"
    },
    {
      title: "Fix Door Lock", 
      category: "Handyman",
      icon: "🔒",
      estimatedTime: "1 hour", 
      estimatedPrice: "€60-120"
    },
    {
      title: "Install Light Fixture",
      category: "Electrical",
      icon: "💡",
      estimatedTime: "2-3 hours",
      estimatedPrice: "€100-200"
    }
  ];

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
            <span className="text-white font-medium">Express Mode</span>
          </div>
          
          <h2 className="text-display text-3xl md:text-4xl font-bold text-white mb-4">
            Quick Fix Today?
          </h2>
          
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Skip the questions. Get matched with available professionals instantly for common tasks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {expressPresets.map((preset, index) => (
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
            ))}
          </div>

          <div className="mt-8">
            <p className="text-white/60 text-sm">
              ⚡ Instant matching • 📱 SMS updates • 💯 Same-day service
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpressModeSection;