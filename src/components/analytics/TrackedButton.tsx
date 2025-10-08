import { Button, ButtonProps } from '@/components/ui/button';
import { useUXMetrics } from '@/hooks/useUXMetrics';
import { useCallback } from 'react';

interface TrackedButtonProps extends ButtonProps {
  eventName: string;
  ctaType?: string;
  location?: string;
}

export function TrackedButton({ 
  eventName,
  ctaType = 'button',
  location = 'unknown',
  onClick,
  children,
  ...props 
}: TrackedButtonProps) {
  const { trackCTAClick } = useUXMetrics();

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    trackCTAClick(eventName, ctaType, location);
    onClick?.(e);
  }, [eventName, ctaType, location, trackCTAClick, onClick]);

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
}