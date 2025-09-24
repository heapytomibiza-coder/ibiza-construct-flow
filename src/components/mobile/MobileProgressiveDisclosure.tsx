import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface MobileProgressiveDisclosureProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  className?: string;
}

export const MobileProgressiveDisclosure = ({
  title,
  children,
  defaultOpen = false,
  icon: Icon,
  badge,
  className
}: MobileProgressiveDisclosureProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors min-h-[56px]"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          <span className="font-medium text-left">{title}</span>
          {badge && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {badge}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <CardContent className="pt-0 pb-4">
          <div className="border-t border-border pt-4">
            {children}
          </div>
        </CardContent>
      )}
    </Card>
  );
};