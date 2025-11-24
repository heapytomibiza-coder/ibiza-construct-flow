/**
 * Client Dashboard Metric Card Component
 * Phase 8: Client Dashboard Enhancement
 * 
 * Premium metric card for client KPIs with gradients and trends
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClientMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down';
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline';
  };
  gradient?: string;
  className?: string;
  onClick?: () => void;
}

export function ClientMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  badge,
  gradient = 'from-copper/10 to-copper/5',
  className,
  onClick
}: ClientMetricCardProps) {
  return (
    <Card 
      className={cn(
        'card-luxury overflow-hidden transition-all hover:shadow-lg',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', gradient)} />
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-foreground/80">
          {title}
        </CardTitle>
        <div className="p-1.5 sm:p-2 bg-background/50 rounded-lg backdrop-blur-sm">
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-copper" />
        </div>
      </CardHeader>
      
      <CardContent className="relative p-3 sm:p-6 pt-0">
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-xl sm:text-2xl font-bold text-charcoal">{value}</div>
          {badge && (
            <Badge 
              variant={badge.variant || 'secondary'} 
              className="text-xs"
            >
              {badge.text}
            </Badge>
          )}
        </div>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
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
            <span className="text-muted-foreground hidden sm:inline">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
