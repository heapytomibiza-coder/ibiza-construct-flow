import React from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface InfoTipProps {
  content: string;
  title?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  iconClassName?: string;
  maxWidth?: string;
}

const InfoTip = React.forwardRef<
  React.ElementRef<typeof Button>,
  InfoTipProps
>(({ 
  content, 
  title, 
  side = 'top', 
  align = 'center',
  className = '',
  iconClassName = '',
  maxWidth = 'max-w-xs',
  ...props 
}, ref) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            size="sm"
            className={`h-auto p-1 text-muted-foreground hover:text-foreground ${className}`}
            {...props}
          >
            <Info className={`h-4 w-4 ${iconClassName}`} />
            <span className="sr-only">More information</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className={`${maxWidth} p-3`}
        >
          {title && (
            <div className="font-semibold text-sm mb-1">
              {title}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {content}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

InfoTip.displayName = 'InfoTip';

export { InfoTip };