import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, Lock, Loader2 } from 'lucide-react';

interface ReviewCTASectionProps {
  onSubmit: () => void;
  loading?: boolean;
  categoryColor?: string;
}

export const ReviewCTASection: React.FC<ReviewCTASectionProps> = ({
  onSubmit,
  loading = false,
  categoryColor = '#D4A574'
}) => {
  const [isPulsing, setIsPulsing] = React.useState(true);

  // Pulse animation every 6 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(false);
      setTimeout(() => setIsPulsing(true), 100);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky bottom-0 bg-background border-t border-sage-muted/20 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] p-4 md:p-6 space-y-4">
      {/* CTA Button */}
      <Button
        onClick={onSubmit}
        disabled={loading}
        size="lg"
        className={`
          w-full h-14 text-base font-semibold
          bg-gradient-to-r from-copper to-copper-dark
          hover:from-copper-dark hover:to-copper
          text-white shadow-lg hover:shadow-xl
          transition-all duration-300
          ${isPulsing && !loading ? 'animate-pulse' : ''}
        `}
        style={{
          background: loading 
            ? undefined 
            : `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)`
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Creating Your Job...
          </>
        ) : (
          'Submit Job & Get Quotes'
        )}
      </Button>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Badge 
          variant="outline" 
          className="gap-2 px-3 py-1.5 bg-background/80 border-sage-muted/30"
        >
          <Lock className="w-4 h-4 text-green-600" />
          <span className="text-xs font-medium">Escrow Protection</span>
        </Badge>

        <Badge 
          variant="outline" 
          className="gap-2 px-3 py-1.5 bg-background/80 border-sage-muted/30"
        >
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium">Verified Professionals</span>
        </Badge>

        <Badge 
          variant="outline" 
          className="gap-2 px-3 py-1.5 bg-background/80 border-sage-muted/30"
        >
          <Star className="w-4 h-4 text-yellow-600" />
          <span className="text-xs font-medium">Rating System</span>
        </Badge>
      </div>

      {/* Reassuring text */}
      <p className="text-center text-sm text-muted-foreground pt-2">
        Your job will be visible to verified professionals in your area. 
        You'll receive quotes within 24-48 hours.
      </p>
    </div>
  );
};
