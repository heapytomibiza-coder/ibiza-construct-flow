import { Card } from '@/components/ui/card';
import { TrendingUp, Clock, DollarSign, Users } from 'lucide-react';

interface QuickStatsGridProps {
  avgProjectValue?: number;
  avgResponseTime?: string;
  repeatClientRate?: number;
  projectsThisMonth?: number;
}

export const QuickStatsGrid = ({
  avgProjectValue,
  avgResponseTime,
  repeatClientRate,
  projectsThisMonth
}: QuickStatsGridProps) => {
  const stats = [
    {
      icon: DollarSign,
      label: 'Avg. Project Value',
      value: avgProjectValue ? `€${avgProjectValue.toLocaleString()}` : 'N/A',
      color: 'from-green-500 to-emerald-500',
      iconColor: 'text-green-600'
    },
    {
      icon: Clock,
      label: 'Response Time',
      value: avgResponseTime || 'N/A',
      color: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-600'
    },
    {
      icon: Users,
      label: 'Repeat Clients',
      value: repeatClientRate ? `${repeatClientRate}%` : 'N/A',
      color: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      label: 'Projects This Month',
      value: projectsThisMonth?.toString() || '0',
      color: 'from-orange-500 to-red-500',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/20"
          >
            <div className="space-y-2">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};