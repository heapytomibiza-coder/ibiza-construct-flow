import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock, ThumbsUp, Users, TrendingUp, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TrustMetricsProps {
  completionRate: number;
  onTimeDelivery: number;
  responseRate: number;
  repeatClientRate: number;
  totalJobs: number;
  yearsActive?: number;
}

export const TrustMetricsCard = ({
  completionRate,
  onTimeDelivery,
  responseRate,
  repeatClientRate,
  totalJobs,
  yearsActive
}: TrustMetricsProps) => {
  const metrics = [
    {
      icon: Shield,
      label: 'Project Completion',
      value: completionRate,
      color: 'text-green-500',
      bgColor: 'bg-green-500'
    },
    {
      icon: Clock,
      label: 'On-Time Delivery',
      value: onTimeDelivery,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500'
    },
    {
      icon: ThumbsUp,
      label: 'Response Rate',
      value: responseRate,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500'
    },
    {
      icon: Users,
      label: 'Repeat Clients',
      value: repeatClientRate,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500'
    }
  ];

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Trust & Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                    <span className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </span>
                  </div>
                  <span className="text-lg font-bold">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalJobs}+</p>
              <p className="text-xs text-muted-foreground">Projects Completed</p>
            </div>
          </div>
          {yearsActive && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{yearsActive}</p>
                <p className="text-xs text-muted-foreground">Years Experience</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};