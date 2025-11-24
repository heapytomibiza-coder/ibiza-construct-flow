/**
 * Quick Actions Panel Component
 * Phase 9: Admin Dashboard Modernization
 * 
 * Admin shortcuts and common tasks
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, Shield, AlertCircle, FileText, 
  DollarSign, MessageSquare, Settings, BarChart3,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: number;
  priority?: 'high' | 'medium' | 'low';
  onClick: () => void;
}

export interface QuickActionsPanelProps {
  actions?: QuickAction[];
  className?: string;
}

export function QuickActionsPanel({ 
  actions = [],
  className 
}: QuickActionsPanelProps) {
  // Default actions
  const defaultActions: QuickAction[] = [
    {
      id: 'verify',
      label: 'Approve Professionals',
      icon: UserCheck,
      count: 5,
      priority: 'high',
      onClick: () => console.log('Approve professionals')
    },
    {
      id: 'disputes',
      label: 'Resolve Disputes',
      icon: AlertCircle,
      count: 3,
      priority: 'high',
      onClick: () => console.log('Resolve disputes')
    },
    {
      id: 'reports',
      label: 'Review Reports',
      icon: FileText,
      count: 12,
      priority: 'medium',
      onClick: () => console.log('Review reports')
    },
    {
      id: 'payments',
      label: 'Process Payouts',
      icon: DollarSign,
      priority: 'medium',
      onClick: () => console.log('Process payments')
    },
    {
      id: 'support',
      label: 'Support Tickets',
      icon: MessageSquare,
      count: 8,
      priority: 'medium',
      onClick: () => console.log('Support tickets')
    },
    {
      id: 'security',
      label: 'Security Alerts',
      icon: Shield,
      count: 2,
      priority: 'high',
      onClick: () => console.log('Security alerts')
    }
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  const priorityConfig = {
    high: 'border-rose-200 dark:border-rose-800 hover:border-rose-300 dark:hover:border-rose-700',
    medium: 'border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700',
    low: 'border-border hover:border-border/80'
  };

  const priorityBadge = {
    high: 'destructive',
    medium: 'secondary',
    low: 'outline'
  };

  return (
    <Card className={cn('card-luxury', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={action.id}
              variant="outline"
              className={cn(
                'w-full justify-between h-auto py-4 px-4 transition-all',
                action.priority && priorityConfig[action.priority]
              )}
              onClick={action.onClick}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  action.priority === 'high' && 'bg-rose-100 dark:bg-rose-950/30',
                  action.priority === 'medium' && 'bg-amber-100 dark:bg-amber-950/30',
                  !action.priority && 'bg-muted'
                )}>
                  <Icon className={cn(
                    'w-4 h-4',
                    action.priority === 'high' && 'text-rose-600',
                    action.priority === 'medium' && 'text-amber-600',
                    !action.priority && 'text-foreground'
                  )} />
                </div>
                <span className="font-medium text-foreground">{action.label}</span>
              </div>
              
              {action.count !== undefined && action.count > 0 && (
                <Badge 
                  variant={action.priority ? priorityBadge[action.priority] as any : 'secondary'}
                  className="ml-auto"
                >
                  {action.count}
                </Badge>
              )}
            </Button>
          );
        })}

        {/* Additional Actions */}
        <div className="pt-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Platform Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Advanced Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
