import { useState, useMemo } from 'react';
import { Info, X, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CalculatorSelections } from '../hooks/useCalculatorState';

interface EducationTip {
  id: string;
  title: string;
  content: string;
  priority: number;
  icon?: 'info' | 'lightbulb' | 'trending' | 'alert';
  trigger: 'selection' | 'always' | 'exclusion_click';
}

interface ContextualEducationPanelProps {
  selections: CalculatorSelections;
  dismissedTips: string[];
  onDismissTip: (tipId: string) => void;
}

const ICON_MAP = {
  info: Info,
  lightbulb: Lightbulb,
  trending: TrendingUp,
  alert: AlertCircle,
};

export function ContextualEducationPanel({ 
  selections, 
  dismissedTips,
  onDismissTip 
}: ContextualEducationPanelProps) {
  const relevantTips = useMemo(() => {
    const tips: EducationTip[] = [];

    // Quality tier tips
    if (selections.qualityTier?.education_content) {
      const content = selections.qualityTier.education_content as any;
      if (content.title && content.content) {
        tips.push({
          id: `tier-${selections.qualityTier.tier_key}`,
          title: content.title,
          content: content.content,
          priority: 1,
          icon: 'info',
          trigger: 'selection'
        });
      }
    }

    // Scope bundle tips
    selections.scopeBundles.forEach(bundle => {
      if (bundle.education_blurbs && Array.isArray(bundle.education_blurbs)) {
        (bundle.education_blurbs as any[]).forEach((blurb: any) => {
          if (blurb.trigger === 'selection' || blurb.trigger === 'always') {
            tips.push({
              id: `bundle-${bundle.id}-${blurb.title}`,
              title: blurb.title,
              content: blurb.content,
              priority: blurb.priority || 2,
              icon: 'lightbulb',
              trigger: blurb.trigger
            });
          }
        });
      }
    });

    // Adder tips
    selections.adders.forEach(adder => {
      if (adder.education_tip) {
        tips.push({
          id: `adder-${adder.id}`,
          title: `About ${adder.display_name}`,
          content: adder.education_tip,
          priority: 3,
          icon: 'trending',
          trigger: 'selection'
        });
      }
    });

    // Filter out dismissed tips and sort by priority
    return tips
      .filter(tip => !dismissedTips.includes(tip.id))
      .sort((a, b) => a.priority - b.priority);
  }, [selections, dismissedTips]);

  if (relevantTips.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Info className="h-4 w-4" />
        Helpful Context
      </h3>
      {relevantTips.map((tip) => {
        const IconComponent = ICON_MAP[tip.icon || 'info'];
        return (
          <TipCard
            key={tip.id}
            tip={tip}
            icon={<IconComponent className="h-5 w-5" />}
            onDismiss={() => onDismissTip(tip.id)}
          />
        );
      })}
    </div>
  );
}

interface TipCardProps {
  tip: EducationTip;
  icon: React.ReactNode;
  onDismiss: () => void;
}

function TipCard({ tip, icon, onDismiss }: TipCardProps) {
  const [isExpanded, setIsExpanded] = useState(tip.priority === 1);

  return (
    <div 
      className={cn(
        "bg-gradient-to-br from-primary/5 to-primary/10",
        "border border-primary/20 rounded-lg overflow-hidden",
        "transition-all duration-200"
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-primary/5 transition-colors"
      >
        <div className="text-primary mt-0.5 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
          {!isExpanded && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {tip.content}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {tip.content}
          </p>
        </div>
      )}
    </div>
  );
}
