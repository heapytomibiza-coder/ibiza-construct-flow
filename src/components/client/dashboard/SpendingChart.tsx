/**
 * Client Spending Chart Component
 * Phase 8: Client Dashboard Enhancement
 * 
 * Visual breakdown of client spending across projects
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Euro, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClientSpending } from '@/hooks/dashboard';
import { useAuth } from '@/hooks/useAuth';

interface SpendingData {
  category: string;
  amount: number;
  projects: number;
  color: string;
}

export interface SpendingChartProps {
  monthlyBudget?: number;
  className?: string;
}

export function SpendingChart({ 
  monthlyBudget,
  className 
}: SpendingChartProps) {
  const { user } = useAuth();
  const { spendingData, totalSpent, loading } = useClientSpending(user?.id);

  const displayData = loading ? [] : spendingData;
  const maxAmount = Math.max(...displayData.map(d => d.amount), 1);
  const budgetUsage = monthlyBudget ? (totalSpent / monthlyBudget) * 100 : 0;

  return (
    <Card className={cn('card-luxury', className)}>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Euro className="w-4 w-4 sm:w-5 sm:h-5 text-copper" />
            Spending Breakdown
          </CardTitle>
          {monthlyBudget && (
            <Badge variant={budgetUsage > 90 ? 'destructive' : 'secondary'} className="text-xs">
              {budgetUsage.toFixed(0)}% of budget
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
        {/* Total Summary */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-copper/10 to-copper/5 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
            <div className="text-2xl font-bold text-charcoal">€{totalSpent.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">This Month</p>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              +12%
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-muted-foreground">By Category</span>
            <span className="text-muted-foreground">Amount</span>
          </div>
          
          {displayData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', item.color)} />
                  <span className="font-medium text-charcoal">{item.category}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.projects} {item.projects === 1 ? 'project' : 'projects'}
                  </Badge>
                </div>
                <span className="font-semibold text-charcoal">€{item.amount.toLocaleString()}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-2 bg-sand-light rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full transition-all', item.color)}
                  style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Budget Alert */}
        {monthlyBudget && budgetUsage > 80 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Approaching Budget Limit
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  You've used {budgetUsage.toFixed(0)}% of your monthly budget
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
