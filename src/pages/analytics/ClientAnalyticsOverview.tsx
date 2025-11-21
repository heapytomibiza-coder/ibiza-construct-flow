import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  TrendingUp, 
  CreditCard, 
  Users, 
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { EventAnalyticsDashboard } from '@/components/analytics/EventAnalyticsDashboard';
import { BackButton } from '@/components/navigation/BackButton';

export default function ClientAnalyticsOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const analyticsCards = [
    {
      title: 'Jobs Analytics',
      description: 'Track your posted jobs, response rates, and hiring metrics',
      icon: Briefcase,
      path: '/dashboard/client/analytics/jobs',
      color: 'text-primary'
    },
    {
      title: 'Hiring Performance',
      description: 'Analyze your hiring timeline, success rates, and quality metrics',
      icon: TrendingUp,
      path: '/dashboard/client/analytics/hiring',
      color: 'text-green-600'
    },
    {
      title: 'Payment & Budget',
      description: 'View spending patterns, budget allocation, and payment history',
      icon: CreditCard,
      path: '/dashboard/client/analytics/payments',
      color: 'text-blue-600'
    },
    {
      title: 'Professional Insights',
      description: 'Compare professionals, view ratings, and track collaborations',
      icon: Users,
      path: '/dashboard/client/analytics/professionals',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton fallbackPath="/dashboard/client" />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Client Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into your hiring and project performance
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsCards.map((card) => (
          <Card 
            key={card.path}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate(card.path)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <card.icon className={`h-6 w-6 ${card.color}`} />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg mt-2">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Overview */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <EventAnalyticsDashboard userId={user?.id} scope="user" />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/post')} variant="default">
            Post New Job
          </Button>
          <Button onClick={() => navigate('/contracts')} variant="outline">
            View Contracts
          </Button>
          <Button onClick={() => navigate('/payments')} variant="outline">
            Payment History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
