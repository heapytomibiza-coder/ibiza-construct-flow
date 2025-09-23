import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Star, Euro, Clock, Shield, MessageCircle } from 'lucide-react';

interface PreferenceCollectorProps {
  onPreferencesChange: (preferences: UserPreferences) => void;
  className?: string;
}

export interface UserPreferences {
  priceWeight: number; // 0-100
  speedWeight: number; // 0-100
  qualityWeight: number; // 0-100
  communicationWeight: number; // 0-100
  insuranceRequired: boolean;
  preferredResponseTime: string;
  budgetFlexibility: string;
}

export const PreferenceCollector = ({ onPreferencesChange, className }: PreferenceCollectorProps) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    priceWeight: 40,
    speedWeight: 30,
    qualityWeight: 70,
    communicationWeight: 50,
    insuranceRequired: false,
    preferredResponseTime: 'within-24h',
    budgetFlexibility: 'moderate'
  });

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    onPreferencesChange(updated);
  };

  const priorityItems = [
    {
      key: 'priceWeight' as const,
      label: 'Best Price',
      icon: Euro,
      description: 'Find the most competitive rates',
      color: 'text-green-600'
    },
    {
      key: 'speedWeight' as const,
      label: 'Quick Response',
      icon: Clock,
      description: 'Fast availability and start times',
      color: 'text-blue-600'
    },
    {
      key: 'qualityWeight' as const,
      label: 'High Quality',
      icon: Star,
      description: 'Top-rated professionals with excellent reviews',
      color: 'text-yellow-600'
    },
    {
      key: 'communicationWeight' as const,
      label: 'Great Communication',
      icon: MessageCircle,
      description: 'Responsive and clear communication',
      color: 'text-purple-600'
    }
  ];

  const getSliderColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Your Matching Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Help us find professionals that match what matters most to you
          </p>
        </div>

        <div className="space-y-6">
          {priorityItems.map(({ key, label, icon: Icon, description, color }) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="font-medium text-sm">{label}</span>
                <Badge variant="outline" className="text-xs">
                  {preferences[key]}% priority
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground">{description}</p>
              
              <div className="px-2">
                <Slider
                  value={[preferences[key]]}
                  onValueChange={(values) => updatePreference(key, values[0])}
                  max={100}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low Priority</span>
                  <span>High Priority</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick preference presets */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3">Quick Presets</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const preset = { ...preferences, priceWeight: 80, qualityWeight: 40, speedWeight: 30 };
                setPreferences(preset);
                onPreferencesChange(preset);
              }}
              className="p-3 text-left rounded-lg border hover:border-primary/20 hover:bg-primary/5 transition-colors"
            >
              <div className="font-medium text-sm">Budget Focused</div>
              <div className="text-xs text-muted-foreground">Best prices</div>
            </button>
            
            <button
              onClick={() => {
                const preset = { ...preferences, qualityWeight: 90, priceWeight: 30, communicationWeight: 70 };
                setPreferences(preset);
                onPreferencesChange(preset);
              }}
              className="p-3 text-left rounded-lg border hover:border-primary/20 hover:bg-primary/5 transition-colors"
            >
              <div className="font-medium text-sm">Quality First</div>
              <div className="text-xs text-muted-foreground">Top professionals</div>
            </button>
          </div>
        </div>

        {/* Additional options */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Insurance Required</span>
              </div>
              <p className="text-xs text-muted-foreground">Only show insured professionals</p>
            </div>
            <button
              onClick={() => updatePreference('insuranceRequired', !preferences.insuranceRequired)}
              className={`
                w-12 h-6 rounded-full relative transition-colors
                ${preferences.insuranceRequired ? 'bg-primary' : 'bg-gray-200'}
              `}
            >
              <div className={`
                w-4 h-4 rounded-full bg-white absolute top-1 transition-transform
                ${preferences.insuranceRequired ? 'translate-x-7' : 'translate-x-1'}
              `} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};