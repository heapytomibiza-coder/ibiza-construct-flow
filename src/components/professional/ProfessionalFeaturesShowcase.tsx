import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Package, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  Calendar,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  MessageCircle,
  FileCheck,
  CreditCard,
  Image,
  Users,
  Star,
  TrendingUp
} from 'lucide-react';

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  status: 'active' | 'ready' | 'coming-soon';
  path?: string;
  action?: string;
  badge?: number;
}

export function ProfessionalFeaturesShowcase() {
  const navigate = useNavigate();
  const unreadMessages = 3; // This should come from actual data
  const unreadJobs = 24; // This should come from actual data

  const features: FeatureCardProps[] = [
    {
      icon: Briefcase,
      title: 'Browse Jobs',
      description: 'Find new opportunities matching your skills and expertise. Get notified when jobs match your profile.',
      status: 'active',
      path: '/job-board',
      action: 'View All Jobs',
      badge: unreadJobs
    },
    {
      icon: Package,
      title: 'My Services',
      description: 'Manage your service offerings, set pricing, and update availability for clients.',
      status: 'active',
      path: '/professional/services',
      action: 'Manage Services'
    },
    {
      icon: Image,
      title: 'Portfolio',
      description: 'Showcase your best work to attract more clients and build your reputation.',
      status: 'active',
      path: '/professional/portfolio',
      action: 'Edit Portfolio'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track your performance metrics, earnings trends, and business growth over time.',
      status: 'active',
      path: '/dashboard/pro/analytics',
      action: 'View Analytics'
    },
    {
      icon: MessageSquare,
      title: 'Messages',
      description: 'Chat with clients, respond to inquiries, and manage all your conversations.',
      status: 'active',
      path: '/messages',
      action: 'Open Inbox',
      badge: unreadMessages
    },
    {
      icon: FileText,
      title: 'Contracts',
      description: 'Manage agreements, project terms, and track all your active contracts.',
      status: 'active',
      path: '/contracts',
      action: 'View Contracts'
    },
    {
      icon: DollarSign,
      title: 'Payments',
      description: 'Track earnings, payment history, and manage your financial transactions.',
      status: 'active',
      path: '/payments',
      action: 'View Payments'
    },
    {
      icon: Calendar,
      title: 'Availability',
      description: 'Set your working hours, time off, and manage your schedule efficiently.',
      status: 'active',
      path: '/availability',
      action: 'Set Availability'
    },
    {
      icon: MessageCircle,
      title: 'Communications',
      description: 'View all client messages and conversation history in one central location.',
      status: 'active',
      path: '/messages',
      action: 'View All'
    },
    {
      icon: FileCheck,
      title: 'Active Projects',
      description: 'Manage your ongoing client projects and track progress milestones.',
      status: 'active',
      path: '/contracts?status=active',
      action: 'View Active'
    },
    {
      icon: CreditCard,
      title: 'Payment History',
      description: 'Review all completed transactions and download payment statements.',
      status: 'active',
      path: '/payments?view=history',
      action: 'View History'
    },
    {
      icon: Star,
      title: 'Reviews & Ratings',
      description: 'View client feedback, manage your ratings, and respond to reviews.',
      status: 'active',
      path: '/professional/reviews',
      action: 'View Reviews'
    },
    {
      icon: Settings,
      title: 'Profile Settings',
      description: 'Update your professional information, preferences, and account details.',
      status: 'active',
      path: '/settings/profile',
      action: 'Settings'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage your alert preferences and stay updated with real-time notifications.',
      status: 'active',
      path: '/settings/notifications',
      action: 'Configure'
    },
    {
      icon: Shield,
      title: 'Verification Status',
      description: 'View your verification level and complete additional verification steps.',
      status: 'active',
      path: '/professional/verification',
      action: 'Get Verified'
    },
    {
      icon: HelpCircle,
      title: 'Help Center',
      description: 'Get support, find answers to common questions, and contact our team.',
      status: 'active',
      path: '/help',
      action: 'Get Help'
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
        <h2 className="text-2xl font-bold mb-1">Professional Features</h2>
        <p className="text-sm text-muted-foreground">
          Everything you need to manage your business and connect with clients.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-primary">{unreadJobs}</div>
          <div className="text-xs text-muted-foreground">New Jobs</div>
        </div>
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-green-600">5</div>
          <div className="text-xs text-muted-foreground">Active Projects</div>
        </div>
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">$2,450</div>
          <div className="text-xs text-muted-foreground">This Month</div>
        </div>
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-purple-600">85%</div>
          <div className="text-xs text-muted-foreground">Profile Complete</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="hover:shadow-md transition-all cursor-pointer group"
            onClick={() => feature.path && navigate(feature.path)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors relative">
                  <feature.icon className="h-4 w-4 text-primary" />
                  {feature.badge !== undefined && feature.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {feature.badge}
                    </Badge>
                  )}
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

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold mb-1">Ready to Grow Your Business?</h3>
            <p className="text-xs text-muted-foreground">
              Complete your profile and start getting more client inquiries today
            </p>
          </div>
          <Button 
            onClick={() => navigate('/professional/profile/edit')}
            className="bg-primary hover:bg-primary/90 ml-4"
          >
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
