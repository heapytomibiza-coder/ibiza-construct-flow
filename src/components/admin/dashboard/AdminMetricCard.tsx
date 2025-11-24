/**
 * Admin Dashboard Metric Card Component
 * Phase 9: Admin Dashboard Modernization
 * 
 * Premium metric card with drill-down and alerts
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, AlertTriangle, ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down';
  };
  alert?: {
    level: 'info' | 'warning' | 'critical';
    message: string;
  };
  gradient?: string;
  className?: string;
  onDrillDown?: () => void;
  actionLabel?: string;
}

export function AdminMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  alert,
  gradient = 'from-primary/10 to-primary/5',
  className,
  onDrillDown,
  actionLabel = 'View Details'
}: AdminMetricCardProps) {
  const alertConfig = {
    info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    critical: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
  };

  return (
    <Card 
      className={cn(
        'card-luxury overflow-hidden transition-all hover:shadow-lg',
        onDrillDown && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={() => !alert && onDrillDown?.()}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', gradient)} />
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-foreground/80">
          {title}
        </CardTitle>
        <div className="p-1.5 sm:p-2.5 bg-background/60 rounded-lg backdrop-blur-sm shadow-sm">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-3 p-3 sm:p-6 pt-0">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl sm:text-3xl font-bold text-foreground">{value}</div>
        </div>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            {trend.direction === 'up' ? (
              <ArrowUp className="w-3 h-3 text-emerald-600" />
            ) : (
              <ArrowDown className="w-3 h-3 text-rose-600" />
            )}
            <span className={cn(
              'font-medium',
              trend.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}

        {alert && (
          <div className={cn('p-2 border rounded-lg text-xs leading-relaxed', alertConfig[alert.level])}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="flex-1 break-words">{alert.message}</span>
            </div>
          </div>
        )}

        {onDrillDown && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between text-xs h-8"
            onClick={(e) => {
              e.stopPropagation();
              onDrillDown();
            }}
          >
            <span className="truncate">{actionLabel}</span>
            <ChevronRight className="w-3 h-3 flex-shrink-0 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
