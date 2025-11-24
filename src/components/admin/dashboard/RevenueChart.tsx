/**
 * Revenue Chart Component
 * Phase 9: Admin Dashboard Modernization
 * 
 * Advanced revenue analytics with trends
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Euro, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueData {
  month: string;
  revenue: number;
  transactions: number;
}

export interface RevenueChartProps {
  data?: RevenueData[];
  totalRevenue: number;
  growth?: number;
  className?: string;
}

export function RevenueChart({ 
  data = [], 
  totalRevenue = 0,
  growth = 0,
  className 
}: RevenueChartProps) {
  // Default mock data
  const displayData = data.length > 0 ? data : [
    { month: 'Jan', revenue: 12500, transactions: 45 },
    { month: 'Feb', revenue: 15800, transactions: 52 },
    { month: 'Mar', revenue: 18200, transactions: 61 },
    { month: 'Apr', revenue: 22400, transactions: 73 },
    { month: 'May', revenue: 28900, transactions: 89 },
    { month: 'Jun', revenue: 31200, transactions: 95 }
  ];

  const maxRevenue = Math.max(...displayData.map(d => d.revenue), 1);

  return (
    <Card className={cn('card-luxury', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5 text-emerald-600" />
            Revenue Overview
          </CardTitle>
          <Badge variant={growth >= 0 ? 'default' : 'destructive'}>
            {growth >= 0 ? '+' : ''}{growth}% Growth
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Total Revenue */}
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <div className="text-3xl font-bold text-foreground">
                €{totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">This Month</p>
              <div className="flex items-center gap-1 text-lg font-semibold text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                €{displayData[displayData.length - 1]?.revenue.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Monthly Breakdown</span>
            <span className="text-muted-foreground">Last 6 Months</span>
          </div>
          
          <div className="space-y-3">
            {displayData.map((item, index) => {
              const percentage = (item.revenue / maxRevenue) * 100;
              const isLatest = index === displayData.length - 1;
              
              return (
                <div key={item.month} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-medium',
                        isLatest && 'text-primary'
                      )}>
                        {item.month}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {item.transactions} orders
                      </Badge>
                    </div>
                    <span className="font-semibold text-foreground">
                      €{item.revenue.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all',
                        isLatest 
                          ? 'bg-gradient-to-r from-primary to-primary/70' 
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {displayData.reduce((sum, d) => sum + d.transactions, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              €{Math.round(totalRevenue / displayData.reduce((sum, d) => sum + d.transactions, 0) || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Avg Order</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {growth >= 0 ? '+' : ''}{growth}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Growth Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
