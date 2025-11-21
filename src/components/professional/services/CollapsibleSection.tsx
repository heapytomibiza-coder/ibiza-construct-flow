import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, ChevronDown, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  isComplete: boolean;
  isActive: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  summary?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  isComplete,
  isActive,
  onToggle,
  children,
  disabled,
  summary,
}) => {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all border-2",
        isActive && "border-primary shadow-md",
        isComplete && !isActive && "border-green-500/30 bg-green-50/50 dark:bg-green-950/20",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Header */}
      <button
        onClick={disabled ? undefined : onToggle}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left transition-colors",
          !disabled && "hover:bg-accent/50",
          isActive && "bg-primary/5",
          isComplete && !isActive && "bg-green-50/50 dark:bg-green-950/20"
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-semibold",
                isActive && "text-primary",
                isComplete && !isActive && "text-green-700 dark:text-green-400"
              )}>
                {title}
              </h3>
              {subtitle && (
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                  {subtitle}
                </span>
              )}
            </div>
            {summary && !isActive && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {summary}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isComplete && !isActive && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
          <ChevronDown className={cn(
            "h-5 w-5 transition-transform flex-shrink-0",
            isActive && "rotate-180"
          )} />
        </div>
      </button>

      {/* Content */}
      {isActive && (
        <div className="p-6 pt-2 border-t animate-in slide-in-from-top-2">
          {children}
        </div>
      )}
    </Card>
  );
};
