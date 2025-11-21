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
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">Platform Features</h2>
        <p className="text-sm text-muted-foreground">
          Everything you need to hire, manage, and collaborate with professionals.
        </p>
      </div>

      {/* Quick Stats - Moved to top */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-primary">12</div>
          <div className="text-xs text-muted-foreground">Features</div>
        </div>
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-green-600">100%</div>
          <div className="text-xs text-muted-foreground">Uptime</div>
        </div>
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">24/7</div>
          <div className="text-xs text-muted-foreground">Support</div>
        </div>
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-purple-600">Secure</div>
          <div className="text-xs text-muted-foreground">Escrow</div>
        </div>
      </div>

      {/* Features Grid - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="hover:shadow-md transition-all cursor-pointer group"
            onClick={() => feature.path && navigate(feature.path)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                {getStatusBadge(feature.status)}
              </div>
              <CardTitle className="text-sm leading-tight">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {feature.description}
              </p>
              {feature.path && feature.status !== 'coming-soon' && (
                <Button 
                  size="sm"
                  variant="outline" 
                  className="w-full h-7 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
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

      {/* Call to Action - Compact */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold mb-1">Ready to Get Started?</h3>
            <p className="text-xs text-muted-foreground">
              Post your first job and experience the full power of our platform
            </p>
          </div>
          <Button 
            onClick={() => navigate('/post')}
            className="bg-primary hover:bg-primary/90 ml-4"
          >
            Post Job
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
