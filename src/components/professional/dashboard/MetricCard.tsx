import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  gradient?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  badge,
  gradient = 'from-primary/10 to-primary/5',
  className
}: MetricCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden group hover:shadow-lg transition-all duration-300",
      className
    )}>
      {/* Gradient Background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-70 transition-opacity",
        gradient
      )} />
      
      {/* Content - Mobile Optimized */}
      <CardContent className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-background/80 rounded-lg shadow-sm">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          {badge && (
            <Badge variant={badge.variant || 'secondary'} className="text-xs">
              {badge.text}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.positive ? "text-green-600" : "text-red-600"
            )}>
              <span>{trend.positive ? '↗' : '↘'}</span>
              <span>{trend.value}%</span>
              <span className="text-muted-foreground ml-1 hidden sm:inline">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
