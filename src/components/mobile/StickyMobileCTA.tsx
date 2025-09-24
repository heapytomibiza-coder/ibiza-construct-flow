import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSafeArea } from '@/components/mobile/SafeAreaProvider';
import { cn } from '@/lib/utils';

interface StickyMobileCTAProps {
  primaryAction: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  className?: string;
  showOnDesktop?: boolean;
}

export const StickyMobileCTA = ({
  primaryAction,
  secondaryAction,
  className,
  showOnDesktop = false
}: StickyMobileCTAProps) => {
  const isMobile = useIsMobile();
  const { insets } = useSafeArea();

  // Only show on mobile unless explicitly requested for desktop
  if (!isMobile && !showOnDesktop) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-t border-border",
        "px-4 py-3",
        className
      )}
      style={{
        paddingBottom: `calc(0.75rem + ${insets.bottom}px)`
      }}
    >
      <div className="flex gap-2 max-w-md mx-auto">
        {secondaryAction && (
          <Button
            variant="outline"
            size="lg"
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
            className="flex-1 min-h-[48px] font-semibold"
          >
            {secondaryAction.label}
          </Button>
        )}
        
        <Button
          size="lg"
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled || primaryAction.loading}
          className={cn(
            "min-h-[48px] font-semibold",
            "bg-gradient-to-r from-primary to-primary-glow border-0",
            secondaryAction ? "flex-1" : "w-full"
          )}
        >
          {primaryAction.loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {primaryAction.label}
            </div>
          ) : (
            primaryAction.label
          )}
        </Button>
      </div>
    </div>
  );
};