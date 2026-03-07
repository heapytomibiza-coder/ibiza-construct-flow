import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface RouteItem {
  path: string;
  label: string;
}

interface RouteSection {
  title: string;
  routes: RouteItem[];
}

const SECTIONS: RouteSection[] = [
  {
    title: '🏠 Public Pages',
    routes: [
      { path: '/', label: 'Landing / Homepage' },
      { path: '/presentation', label: 'Presentation' },
      { path: '/services', label: 'Services Discovery' },
      { path: '/discovery', label: 'Discovery' },
      { path: '/jobs-discovery', label: 'Jobs Discovery' },
      { path: '/job-board', label: 'Job Board' },
      { path: '/calculator', label: 'Calculator' },
      { path: '/how-it-works', label: 'How It Works' },
      { path: '/contact', label: 'Contact' },
      { path: '/professionals', label: 'Browse Professionals' },
      { path: '/specialist-categories', label: 'Specialist Categories' },
      { path: '/fair', label: 'Fair Showcase' },
      { path: '/fair/onboarding', label: 'Fair Exhibitor Onboarding' },
      { path: '/book', label: 'Booking Page' },
      { path: '/install', label: 'Install PWA' },
      { path: '/micro-services-reference', label: 'Micro Services Reference' },
      { path: '/color-preview', label: 'Color Preview' },
      { path: '/test', label: 'Design Test' },
    ],
  },
  {
    title: '🔐 Auth Flow',
    routes: [
      { path: '/auth', label: 'Sign In / Sign Up' },
      { path: '/auth/verify-email', label: 'Verify Email' },
      { path: '/auth/forgot-password', label: 'Forgot Password' },
      { path: '/auth/reset-password', label: 'Reset Password' },
      { path: '/auth/quick-start', label: 'Quick Start' },
      { path: '/role-switcher', label: 'Role Switcher' },
    ],
  },
  {
    title: '👤 Client Pages',
    routes: [
      { path: '/dashboard/client', label: 'Client Dashboard' },
      { path: '/post', label: 'Post a Job (Wizard)' },
      { path: '/post/success', label: 'Post Job Success' },
      { path: '/templates', label: 'Job Templates' },
      { path: '/dashboard/client/analytics', label: 'Client Analytics Overview' },
      { path: '/dashboard/client/analytics/jobs', label: 'Client Jobs Analytics' },
      { path: '/dashboard/client/analytics/hiring', label: 'Client Hiring Analytics' },
      { path: '/dashboard/client/analytics/payments', label: 'Client Payment Analytics' },
      { path: '/dashboard/client/analytics/professionals', label: 'Client Pro Analytics' },
    ],
  },
  {
    title: '🔧 Professional Pages',
    routes: [
      { path: '/dashboard/pro', label: 'Pro Dashboard' },
      { path: '/dashboard/pro/service-menu', label: 'Service Menu Builder' },
      { path: '/onboarding/professional', label: 'Pro Onboarding' },
      { path: '/professional/verification', label: 'Pro Verification' },
      { path: '/professional/service-setup', label: 'Service Setup Wizard' },
      { path: '/professional/payout-setup', label: 'Payout Setup' },
      { path: '/professional/services', label: 'Pro Services' },
      { path: '/professional/services/wizard', label: 'Services Wizard' },
      { path: '/services/new', label: 'Create Service' },
      { path: '/professional/portfolio', label: 'Portfolio' },
      { path: '/professional/insights', label: 'Pro Insights' },
      { path: '/availability', label: 'Availability' },
      { path: '/calendar', label: 'Calendar' },
      { path: '/earnings', label: 'Earnings' },
    ],
  },
  {
    title: '💬 Messaging',
    routes: [
      { path: '/messages', label: 'Messages' },
      { path: '/messaging', label: 'Messaging (Alt)' },
    ],
  },
  {
    title: '📄 Contracts & Payments',
    routes: [
      { path: '/contracts', label: 'Contract Management' },
      { path: '/payments', label: 'Payments' },
      { path: '/disputes', label: 'Dispute Center' },
      { path: '/payment-success', label: 'Payment Success' },
      { path: '/payment-canceled', label: 'Payment Canceled' },
      { path: '/subscription-success', label: 'Subscription Success' },
      { path: '/subscription-canceled', label: 'Subscription Canceled' },
    ],
  },
  {
    title: '⚙️ Settings',
    routes: [
      { path: '/settings/profile', label: 'Profile Settings' },
      { path: '/settings/account', label: 'Account Settings' },
      { path: '/settings/notifications', label: 'Notification Settings' },
      { path: '/settings/client', label: 'Client Settings' },
      { path: '/settings/professional', label: 'Professional Settings' },
    ],
  },
  {
    title: '🛡️ Admin - Core',
    routes: [
      { path: '/admin', label: 'Admin Dashboard' },
      { path: '/admin/home', label: 'Admin Home' },
      { path: '/admin/overview', label: 'Admin Overview' },
      { path: '/admin/users', label: 'Users Management' },
      { path: '/admin/profiles', label: 'Profiles Queue' },
      { path: '/admin/jobs', label: 'Jobs Management' },
      { path: '/admin/bookings', label: 'Bookings' },
      { path: '/admin/services', label: 'Services' },
      { path: '/admin/disputes', label: 'Disputes Queue' },
    ],
  },
  {
    title: '📊 Admin - Analytics & Monitoring',
    routes: [
      { path: '/admin/analytics', label: 'Analytics' },
      { path: '/admin/analytics/disputes', label: 'Dispute Analytics' },
      { path: '/admin/performance', label: 'Performance Monitor' },
      { path: '/admin/intelligence', label: 'Intelligence' },
      { path: '/admin/health', label: 'Health Monitor' },
    ],
  },
  {
    title: '🔧 Admin - Configuration',
    routes: [
      { path: '/admin/settings', label: 'Admin Settings' },
      { path: '/admin/security', label: 'Security Settings' },
      { path: '/admin/feature-flags', label: 'Feature Flags' },
      { path: '/admin/integrations', label: 'Integration Hub' },
      { path: '/admin/website-settings', label: 'Website Settings' },
    ],
  },
  {
    title: '🧰 Admin - Tools',
    routes: [
      { path: '/admin/database', label: 'Database Overview' },
      { path: '/admin/utils', label: 'Admin Utils' },
      { path: '/admin/user-inspector', label: 'User Inspector' },
      { path: '/admin/test-runner', label: 'Test Runner' },
      { path: '/admin/audit-log', label: 'Audit Log' },
      { path: '/admin/documents', label: 'Document Review' },
      { path: '/admin/profile-moderation', label: 'Profile Moderation' },
      { path: '/admin/moderation/reviews', label: 'Review Moderation' },
      { path: '/admin/verifications', label: 'Verifications' },
      { path: '/admin/reports', label: 'Reports' },
    ],
  },
  {
    title: '📝 Admin - Content & Questions',
    routes: [
      { path: '/admin/questions', label: 'Question Pack Management' },
      { path: '/admin/question-pack-audit', label: 'Question Pack Audit' },
      { path: '/admin/question-pack-standardizer', label: 'Tone Standardizer' },
      { path: '/admin/question-pack-generator', label: 'Pack Generator' },
      { path: '/admin/question-builder', label: 'Question Builder' },
      { path: '/admin/bulk-import', label: 'Bulk Import' },
      { path: '/admin/import-services', label: 'Import Services' },
      { path: '/admin/service-manager', label: 'Service Manager' },
      { path: '/admin/seed-commercial', label: 'Seed Commercial Q' },
      { path: '/admin/seed-architects-design', label: 'Seed Architects Q' },
      { path: '/admin/seed-painting', label: 'Seed Painting Q' },
    ],
  },
  {
    title: '🧮 Admin - Calculator',
    routes: [
      { path: '/admin/calculator', label: 'Calculator Settings' },
      { path: '/admin/calculator/pricing', label: 'Pricing Manager' },
      { path: '/admin/calculator/analytics', label: 'Calculator Analytics' },
    ],
  },
  {
    title: '🎫 Admin - Support',
    routes: [
      { path: '/admin/helpdesk', label: 'Helpdesk' },
    ],
  },
  {
    title: '📜 Legal',
    routes: [
      { path: '/terms', label: 'Terms of Service' },
      { path: '/privacy', label: 'Privacy Policy' },
      { path: '/cookie-policy', label: 'Cookie Policy' },
    ],
  },
];

const STORAGE_KEY = 'page-checklist-state';

export default function PageChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const totalRoutes = SECTIONS.reduce((sum, s) => sum + s.routes.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = totalRoutes > 0 ? (checkedCount / totalRoutes) * 100 : 0;

  const toggle = (path: string) => {
    setChecked(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const clearAll = () => setChecked({});

  return (
    <>
      <Helmet>
        <title>Page Review Checklist</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto py-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  Page Review Checklist
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {checkedCount} / {totalRoutes} pages reviewed
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={progress} className="w-40 h-3" />
                <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                  {Math.round(progress)}%
                </Badge>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-6 px-4 space-y-6">
          {SECTIONS.map((section) => {
            const sectionChecked = section.routes.filter(r => checked[r.path]).length;
            return (
              <Card key={section.title}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{section.title}</span>
                    <Badge variant={sectionChecked === section.routes.length ? 'default' : 'outline'} className="text-xs">
                      {sectionChecked}/{section.routes.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {section.routes.map((route) => (
                      <div
                        key={route.path}
                        className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                          checked[route.path] ? 'bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={route.path}
                            checked={!!checked[route.path]}
                            onCheckedChange={() => toggle(route.path)}
                          />
                          <label
                            htmlFor={route.path}
                            className={`text-sm cursor-pointer ${
                              checked[route.path] ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {route.label}
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded hidden sm:block">
                            {route.path}
                          </code>
                          <Link to={route.path}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
