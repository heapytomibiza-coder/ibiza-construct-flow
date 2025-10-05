import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  status?: string;
  statusVariant?: "default" | "secondary" | "destructive" | "outline";
  facts?: Array<{ label: string; value: string; icon?: React.ReactNode }>;
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, title, status, statusVariant = "default", facts, primaryAction, secondaryAction, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200",
          "p-6 space-y-4",
          className
        )}
        {...props}
      >
        {/* Header with title and status */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          {status && (
            <Badge variant={statusVariant} className="shrink-0">
              {status}
            </Badge>
          )}
        </div>

        {/* Key facts */}
        {facts && facts.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {facts.map((fact, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm"
              >
                {fact.icon && <span className="text-muted-foreground">{fact.icon}</span>}
                <span className="font-medium">{fact.label}:</span>
                <span className="text-muted-foreground">{fact.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Custom content */}
        {children}

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex gap-3 pt-2">
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                disabled={primaryAction.loading}
                className="flex-1 h-11"
              >
                {primaryAction.loading ? "Loading..." : primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                className="flex-1 h-11"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);
PremiumCard.displayName = "PremiumCard";

export { PremiumCard };
