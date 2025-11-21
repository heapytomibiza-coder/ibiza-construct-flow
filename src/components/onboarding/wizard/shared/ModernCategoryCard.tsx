import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernCategoryCardProps {
  name: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  gradient?: string;
  serviceCount?: number;
  isPopular?: boolean;
}

export function ModernCategoryCard({
  name,
  icon,
  isSelected,
  onClick,
  gradient = 'from-primary/20 to-primary/10',
  serviceCount,
  isPopular
}: ModernCategoryCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative p-6 cursor-pointer transition-all duration-300",
        "hover:scale-105 hover:shadow-xl group",
        "flex flex-col items-center justify-center gap-3 min-h-[160px]",
        isSelected
          ? `border-primary shadow-lg bg-gradient-to-br ${gradient}`
          : "border-border hover:border-primary/50"
      )}
    >
      {isPopular && (
        <Badge 
          variant="secondary" 
          className="absolute top-3 right-3 text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
        >
          🔥 Popular
        </Badge>
      )}
      
      <div className={cn(
        "transition-all duration-300 transform group-hover:scale-110",
        isSelected ? "text-primary scale-110" : "text-muted-foreground"
      )}>
        {icon}
      </div>
      
      <div className="text-center space-y-1">
        <div className={cn(
          "font-semibold",
          isSelected && "text-primary"
        )}>
          {name}
        </div>
        {serviceCount && (
          <div className="text-xs text-muted-foreground">
            {serviceCount} services
          </div>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-3 left-3">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
        </div>
      )}
    </Card>
  );
}
