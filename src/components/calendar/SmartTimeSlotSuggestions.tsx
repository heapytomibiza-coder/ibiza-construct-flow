import { useCalendarOverlap } from '@/hooks/useCalendarOverlap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Zap, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { formatTime } from '@/lib/ibiza-defaults';
import { cn } from '@/lib/utils';

interface SmartTimeSlotSuggestionsProps {
  userId1: string;
  userId2: string;
  targetDate?: Date;
  onSelectSlot: (start: Date, end: Date) => void;
  className?: string;
}

export const SmartTimeSlotSuggestions = ({
  userId1,
  userId2,
  targetDate,
  onSelectSlot,
  className
}: SmartTimeSlotSuggestionsProps) => {
  const { suggestions, loading, findOverlaps } = useCalendarOverlap(userId1, userId2);

  const getConfidenceIcon = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return <Zap className="w-4 h-4 text-green-600" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConfidenceLabel = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'Best Match';
      case 'medium':
        return 'Good Match';
      case 'low':
        return 'Available';
    }
  };

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            Finding best times for both calendars...
          </p>
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <p className="font-medium">No overlapping times found</p>
            <p className="text-sm text-muted-foreground">
              Try selecting a different date or extending the search window
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => findOverlaps(targetDate)}
          >
            Search Again
          </Button>
        </div>
      </Card>
    );
  }

  const earliestSlot = suggestions[0];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Earliest overlap highlight */}
      <Card className="p-6 border-2 border-primary bg-primary/5">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <p className="font-semibold">Earliest Overlap</p>
            <Badge variant="default">One tap to confirm</Badge>
          </div>

          <div className="flex items-center gap-4 text-lg font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span>{format(earliestSlot.start, 'EEE, MMM d')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span>
                {formatTime(earliestSlot.start)} – {formatTime(earliestSlot.end)}
              </span>
            </div>
          </div>

          <Button
            onClick={() => onSelectSlot(earliestSlot.start, earliestSlot.end)}
            size="lg"
            className="w-full"
          >
            Confirm This Time
          </Button>
        </div>
      </Card>

      {/* Alternative suggestions */}
      {suggestions.length > 1 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            3 Best Alternative Times
          </p>

          <div className="grid gap-3">
            {suggestions.slice(1, 4).map((suggestion, index) => (
              <Card
                key={index}
                className="p-4 hover:border-primary cursor-pointer transition-all"
                onClick={() => onSelectSlot(suggestion.start, suggestion.end)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getConfidenceIcon(suggestion.confidence)}
                      <span className="font-medium">
                        {format(suggestion.start, 'EEE, MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(suggestion.start)} – {formatTime(suggestion.end)}
                      <span className="ml-2">({suggestion.duration} min)</span>
                    </p>
                  </div>

                  <Badge variant="secondary">
                    {getConfidenceLabel(suggestion.confidence)}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center">
        Times shown are when both calendars are free during business hours
      </p>
    </div>
  );
};
