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
        "backdrop-blur-md bg-background/90 border-2 border-background shadow-lg text-xs font-medium",
        className
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      <span>
        {category}
        {subcategory && ` • ${subcategory}`}
        {micro && ` • ${micro}`}
      </span>
    </Badge>
  );
};
