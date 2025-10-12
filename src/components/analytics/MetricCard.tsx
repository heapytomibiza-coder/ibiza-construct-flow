import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number | 'up' | 'down' | 'neutral';
  description?: string;
  className?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  className 
}: MetricCardProps) => {
  // Handle both numeric and string trend types
  const getTrendInfo = () => {
    if (typeof trend === 'number') {
      return {
        isPositive: trend > 0,
        Icon: trend > 0 ? TrendingUp : TrendingDown,
        value: Math.abs(trend),
        color: trend > 0 ? 'text-green-600' : 'text-red-600'
      };
    }
    if (typeof trend === 'string') {
      switch (trend) {
        case 'up':
          return { Icon: TrendingUp, color: 'text-green-600' };
        case 'down':
          return { Icon: TrendingDown, color: 'text-red-600' };
        case 'neutral':
          return { Icon: Minus, color: 'text-gray-600' };
        default:
          return null;
      }
    }
    return null;
  };

  const trendInfo = getTrendInfo();

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trendInfo && trendInfo.Icon && (
            <trendInfo.Icon className={cn('h-4 w-4', trendInfo.color)} />
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {typeof trend === 'number' && trendInfo && (
          <div className="flex items-center mt-2">
            <span className={cn('text-xs font-medium', trendInfo.color)}>
              {trendInfo.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
