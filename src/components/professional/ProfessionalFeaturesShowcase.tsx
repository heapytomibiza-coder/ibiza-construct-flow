import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  BarChart3, 
  CreditCard, 
  MessageSquare,
  Star,
  Users,
  Shield,
  CheckCircle,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  FileText,
  Award,
  Wrench
} from 'lucide-react';

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  status: 'active' | 'ready' | 'coming-soon';
  path?: string;
  action?: string;
}

export function ProfessionalFeaturesShowcase() {
  const navigate = useNavigate();

  const features: FeatureCardProps[] = [
    {
      icon: Briefcase,
      title: 'Job Board',
      description: 'Browse available jobs, submit quotes, and win projects. Filter by category, budget, and location.',
      status: 'active',
      path: '/job-board',
      action: 'Browse Jobs'
    },
    {
      icon: FileText,
      title: 'My Services',
      description: 'Create and manage your service offerings. Set pricing, availability, and showcase your expertise.',
      status: 'active',
      path: '/professional/services',
      action: 'Manage Services'
    },
    {
      icon: Star,
      title: 'Portfolio',
      description: 'Showcase your best work with photos, descriptions, and client testimonials to attract more clients.',
      status: 'active',
      path: '/professional/portfolio',
      action: 'Build Portfolio'
    },
    {
      icon: BarChart3,
      title: 'Earnings & Analytics',
      description: 'Track your income, job performance, client satisfaction ratings, and business growth metrics.',
      status: 'active',
      path: '/earnings',
      action: 'View Earnings'
    },
    {
      icon: MessageSquare,
      title: 'Client Communications',
      description: 'Chat with clients, share project updates, negotiate terms, and build lasting relationships.',
      status: 'active',
      path: '/messages',
      action: 'Open Messages'
    },
    {
      icon: FileText,
      title: 'Contract Management',
      description: 'Review and accept contracts, track milestones, manage deliverables, and ensure clear agreements.',
      status: 'active',
      path: '/contracts',
      action: 'View Contracts'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Receive payments through escrow protection. Track earnings, request payouts, and view transaction history.',
      status: 'active',
      path: '/payments',
      action: 'Manage Payments'
    },
    {
      icon: Calendar,
      title: 'Availability Calendar',
      description: 'Set your working hours, block off dates, and let clients know when you\'re available for projects.',
      status: 'active',
      path: '/availability',
      action: 'Set Availability'
    },
    {
      icon: Shield,
      title: 'Verification Badge',
      description: 'Get verified to build trust. Upload credentials, certifications, and insurance documentation.',
      status: 'active',
      path: '/professional/verification',
      action: 'Get Verified'
    },
    {
      icon: Users,
      title: 'Client Matching',
      description: 'Our AI matches you with ideal clients based on your skills, experience, and preferences.',
      status: 'active',
      path: '/job-board',
      action: 'View Matches'
    },
    {
      icon: TrendingUp,
      title: 'Performance Insights',
      description: 'Get personalized recommendations to improve your profile, win more jobs, and increase earnings.',
      status: 'active',
      path: '/dashboard/pro',
      action: 'View Insights'
    },
    {
      icon: Award,
      title: 'Professional Profile',
      description: 'Your public profile showcasing skills, experience, reviews, and completed projects to attract clients.',
      status: 'active',
      path: '/settings/professional',
      action: 'Edit Profile'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Instant alerts for new job opportunities, client messages, payments, and contract updates.',
      status: 'active',
      path: '/settings/notifications',
      action: 'Configure'
    },
    {
      icon: Wrench,
      title: 'Service Setup Wizard',
      description: 'Guided setup to create professional service packages with pricing tiers and add-ons.',
      status: 'active',
      path: '/professional/service-setup',
      action: 'Setup Services'
    },
    {
      icon: CreditCard,
      title: 'Payout Settings',
      description: 'Configure bank account details, payment schedules, and tax information for smooth payouts.',
      status: 'active',
      path: '/professional/payout-setup',
      action: 'Setup Payouts'
    },
    {
      icon: Settings,
      title: 'Account Settings',
      description: 'Manage your profile, service radius, notification preferences, and security settings.',
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
        <h2 className="text-2xl font-bold mb-1">Professional Tools & Features</h2>
        <p className="text-sm text-muted-foreground">
          Everything you need to grow your business and win more projects.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-primary">16</div>
          <div className="text-xs text-muted-foreground">Features</div>
        </div>
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-green-600">100%</div>
          <div className="text-xs text-muted-foreground">Protected</div>
        </div>
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">24/7</div>
          <div className="text-xs text-muted-foreground">Support</div>
        </div>
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <div className="text-xl font-bold text-purple-600">Fast</div>
          <div className="text-xs text-muted-foreground">Payouts</div>
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

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold mb-1">Ready to Grow Your Business?</h3>
            <p className="text-xs text-muted-foreground">
              Complete your profile and start winning quality projects today
            </p>
          </div>
          <Button 
            onClick={() => navigate('/job-board')}
            className="bg-primary hover:bg-primary/90 ml-4"
          >
            Browse Jobs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
