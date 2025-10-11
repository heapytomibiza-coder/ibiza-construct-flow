import { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, Hammer, Wrench, Zap, Droplets, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InclusionItem {
  text: string;
  icon?: 'hammer' | 'wrench' | 'zap' | 'droplets';
  category?: string;
}

interface ExclusionItem extends InclusionItem {
  canAddAsAdder?: boolean;
  addPrice?: number;
  adderKey?: string;
}

interface InclusionExclusionListProps {
  included: string[];
  excluded: string[];
  onAddExclusionAsAdder?: (item: string) => void;
  compact?: boolean;
}

const ICON_MAP = {
  hammer: Hammer,
  wrench: Wrench,
  zap: Zap,
  droplets: Droplets,
};

const getCategoryIcon = (text: string): keyof typeof ICON_MAP | undefined => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('electric') || lowerText.includes('lighting')) return 'zap';
  if (lowerText.includes('plumb') || lowerText.includes('water')) return 'droplets';
  if (lowerText.includes('structural') || lowerText.includes('wall')) return 'hammer';
  return 'wrench';
};

export function InclusionExclusionList({ 
  included, 
  excluded, 
  onAddExclusionAsAdder,
  compact = false 
}: InclusionExclusionListProps) {
  const [showAllIncluded, setShowAllIncluded] = useState(false);
  const [showAllExcluded, setShowAllExcluded] = useState(false);

  const INITIAL_SHOW_COUNT = compact ? 4 : 6;
  
  const displayedIncluded = showAllIncluded 
    ? included 
    : included.slice(0, INITIAL_SHOW_COUNT);
  
  const displayedExcluded = showAllExcluded 
    ? excluded 
    : excluded.slice(0, INITIAL_SHOW_COUNT);

  const renderItem = (
    item: string, 
    index: number, 
    isIncluded: boolean,
    canAdd?: boolean
  ) => {
    const IconComponent = ICON_MAP[getCategoryIcon(item) || 'wrench'];

    return (
      <li 
        key={index} 
        className={cn(
          "flex items-start gap-3 py-2 transition-colors",
          "hover:bg-muted/50 px-3 -mx-3 rounded-md"
        )}
      >
        <div className={cn(
          "mt-0.5 flex-shrink-0",
          isIncluded ? "text-primary" : "text-muted-foreground"
        )}>
          <IconComponent className="h-4 w-4" />
        </div>
        <span className="text-sm flex-1">{item}</span>
        {!isIncluded && canAdd && onAddExclusionAsAdder && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 flex-shrink-0"
            onClick={() => onAddExclusionAsAdder(item)}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-6">
      {/* Included Items */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-semibold">What's Included</h4>
        </div>
        <ul className="space-y-1">
          {displayedIncluded.map((item, idx) => 
            renderItem(item, idx, true)
          )}
        </ul>
        {included.length > INITIAL_SHOW_COUNT && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllIncluded(!showAllIncluded)}
            className="mt-2 text-xs gap-1"
          >
            {showAllIncluded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                View All {included.length} Items
              </>
            )}
          </Button>
        )}
      </div>

      {/* Excluded Items */}
      {excluded.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="h-4 w-4 text-destructive" />
            </div>
            <h4 className="font-semibold">Not Included</h4>
          </div>
          <ul className="space-y-1">
            {displayedExcluded.map((item, idx) => 
              renderItem(item, idx, false, true)
            )}
          </ul>
          {excluded.length > INITIAL_SHOW_COUNT && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllExcluded(!showAllExcluded)}
              className="mt-2 text-xs gap-1"
            >
              {showAllExcluded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  View All {excluded.length} Items
                </>
              )}
            </Button>
          )}
          {onAddExclusionAsAdder && (
            <p className="text-xs text-muted-foreground mt-3 px-3">
              Items marked "Add" can be included for an additional cost
            </p>
          )}
        </div>
      )}
    </div>
  );
}
