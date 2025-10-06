import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  unit?: string;
  target?: number;
  previousValue?: number;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

export const KPICard = ({
  title,
  value,
  unit,
  target,
  previousValue,
  trend,
  className = ''
}: KPICardProps) => {
  const formatValue = (val: number) => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(val);
    }
    if (unit === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    return val.toLocaleString();
  };

  const calculateChange = () => {
    if (!previousValue) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return change;
  };

  const change = calculateChange();
  const targetProgress = target ? (value / target) * 100 : null;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {trend && getTrendIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold">{formatValue(value)}</div>

          <div className="flex items-center gap-2 text-sm">
            {change !== null && (
              <span className={getTrendColor()}>
                {change > 0 ? '+' : ''}
                {change.toFixed(1)}%
              </span>
            )}
            {change !== null && <span className="text-muted-foreground">vs previous</span>}
          </div>

          {target && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Target: {formatValue(target)}</span>
                <span>{targetProgress?.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    targetProgress && targetProgress >= 100
                      ? 'bg-green-500'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(targetProgress || 0, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
