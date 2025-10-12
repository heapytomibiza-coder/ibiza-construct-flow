import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ServiceCategoryBadgeProps {
  category?: string;
  subcategory?: string;
  micro?: string;
  icon?: string;
  className?: string;
}

export const ServiceCategoryBadge: React.FC<ServiceCategoryBadgeProps> = ({
  category,
  subcategory,
  micro,
  icon,
  className
}) => {
  if (!category) return null;

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "backdrop-blur-sm bg-background/95 border-2 border-primary/20 shadow-md text-xs font-semibold hover:bg-background/100 transition-colors",
        className
      )}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      <span>
        {category}
        {subcategory && ` • ${subcategory}`}
        {micro && ` • ${micro}`}
      </span>
    </Badge>
  );
};
