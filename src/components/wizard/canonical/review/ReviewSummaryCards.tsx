import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Calendar, FileText, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCard {
  icon: React.ElementType;
  label: string;
  value: string;
  sectionId: string;
}

interface ReviewSummaryCardsProps {
  cards: SummaryCard[];
  onEdit?: (sectionId: string) => void;
  categoryColor?: string;
}

export const ReviewSummaryCards: React.FC<ReviewSummaryCardsProps> = ({
  cards,
  onEdit,
  categoryColor = '#D4A574'
}) => {
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <Card
          key={card.sectionId}
          className={cn(
            "relative p-5 border-sage-muted/20 bg-card hover:shadow-lg transition-all duration-200 cursor-pointer group",
            hoveredCard === card.sectionId && "scale-[1.02]"
          )}
          onMouseEnter={() => setHoveredCard(card.sectionId)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => onEdit?.(card.sectionId)}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div 
              className="p-3 rounded-lg bg-sage-light/20 flex-shrink-0"
              style={{ 
                borderLeft: `3px solid ${categoryColor}` 
              }}
            >
              <card.icon className="w-5 h-5" style={{ color: categoryColor }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase font-semibold text-muted-foreground mb-1 tracking-wide">
                {card.label}
              </p>
              <p className="text-base font-semibold text-foreground truncate">
                {card.value}
              </p>
            </div>

            {/* Edit icon - appears on hover */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-sage-light/30"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(card.sectionId);
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Helper to create cards from wizard data
export const createSummaryCards = (data: {
  location?: string;
  budget?: string;
  timeline?: string;
  description?: string;
}): SummaryCard[] => {
  const cards: SummaryCard[] = [];

  if (data.location) {
    cards.push({
      icon: MapPin,
      label: 'Location',
      value: data.location,
      sectionId: 'logistics'
    });
  }

  if (data.budget) {
    cards.push({
      icon: DollarSign,
      label: 'Budget',
      value: data.budget,
      sectionId: 'logistics'
    });
  }

  if (data.timeline) {
    cards.push({
      icon: Calendar,
      label: 'Timeline',
      value: data.timeline,
      sectionId: 'logistics'
    });
  }

  if (data.description) {
    cards.push({
      icon: FileText,
      label: 'Description',
      value: data.description.length > 50 
        ? data.description.substring(0, 50) + '...'
        : data.description,
      sectionId: 'basics'
    });
  }

  return cards;
};
