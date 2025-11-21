import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  BarChart3, 
  CreditCard, 
  MessageSquare,
  FileText,
  Users,
  Shield,
  CheckCircle,
  TrendingUp,
  Calendar,
  Bell,
  Settings
} from 'lucide-react';

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  status: 'active' | 'ready' | 'coming-soon';
  path?: string;
  action?: string;
}

export function ClientFeaturesShowcase() {
  const navigate = useNavigate();

  const features: FeatureCardProps[] = [
    {
      icon: Briefcase,
      title: 'Post Jobs',
      description: 'Create detailed job postings and receive quotes from qualified professionals in your area.',
      status: 'active',
      path: '/post',
      action: 'Post a Job'
    },
    {
      icon: Users,
      title: 'Browse Professionals',
      description: 'Discover and compare verified professionals. View ratings, portfolios, and past work.',
      status: 'active',
      path: '/professionals',
      action: 'Find Professionals'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track your hiring performance, spending patterns, and professional relationships with detailed metrics.',
      status: 'active',
      path: '/dashboard/client/analytics',
      action: 'View Analytics'
    },
    {
      icon: MessageSquare,
      title: 'Direct Messaging',
      description: 'Communicate directly with professionals. Share files, discuss project details, and manage conversations.',
      status: 'active',
      path: '/messages',
      action: 'Open Messages'
    },
    {
      icon: FileText,
      title: 'Contract Management',
      description: 'Create, manage, and track all your contracts in one place. Digital signatures and milestone tracking included.',
      status: 'active',
      path: '/contracts',
      action: 'View Contracts'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Escrow-protected payments, milestone releases, and detailed payment history. Your funds are always secure.',
      status: 'active',
      path: '/payments',
      action: 'Manage Payments'
    },
    {
      icon: Shield,
      title: 'Escrow Protection',
      description: 'All payments are held in escrow until work is completed to your satisfaction. Dispute resolution included.',
      status: 'active',
      path: '/contracts',
      action: 'Learn More'
    },
    {
      icon: CheckCircle,
      title: 'Job Matching',
      description: 'Our AI-powered system matches you with the best professionals for your specific project needs.',
      status: 'active',
      path: '/jobs-discovery',
      action: 'See Matches'
    },
    {
      icon: TrendingUp,
      title: 'Hiring Insights',
      description: 'Get recommendations on budget, timelines, and professional selection based on your project history.',
      status: 'active',
      path: '/dashboard/client/analytics/hiring',
      action: 'View Insights'
    },
    {
      icon: Calendar,
      title: 'Project Timeline',
      description: 'Visual timeline for all your projects. Track milestones, deadlines, and professional availability.',
      status: 'ready',
      path: '/dashboard/client',
      action: 'View Timeline'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Real-time alerts for quotes, messages, milestone completions, and payment updates.',
      status: 'active',
      path: '/settings/notifications',
      action: 'Configure'
    },
    {
      icon: Settings,
      title: 'Account Settings',
      description: 'Manage your profile, payment methods, notification preferences, and security settings.',
      status: 'active',
      path: '/settings/profile',
      action: 'Settings'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
            Active
          </span>
        );
      case 'ready':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            Ready
          </span>
        );
      case 'coming-soon':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full">
            Coming Soon
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Platform Features</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Everything you need to hire, manage, and collaborate with professionals. 
          All features are designed to make your projects successful.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
            onClick={() => feature.path && navigate(feature.path)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                {getStatusBadge(feature.status)}
              </div>
              <CardTitle className="text-lg mt-4">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
              {feature.path && feature.status !== 'coming-soon' && (
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(feature.path!);
                  }}
                >
                  {feature.action}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Platform Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Features Active</div>
            </div>
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">Secure</div>
              <div className="text-sm text-muted-foreground">Escrow Protected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-4">
            Post your first job and experience the full power of our platform
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/post')}
            className="bg-primary hover:bg-primary/90"
          >
            Post Your First Job
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
