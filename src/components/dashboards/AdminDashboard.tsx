import { useState, lazy, Suspense } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Bot, Command, Folder, Users, CreditCard, Shield, Settings, Home, TrendingUp, Activity, FileCheck, AlertTriangle, Brain, Search, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { InfoTip } from '@/components/ui/info-tip';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';
import { usePendingVerifications } from '@/hooks/usePendingVerifications';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import EarlyWarningPanel from '@/components/disputes/EarlyWarningPanel';
import { Link } from 'react-router-dom';
import { AdminSeedTestButtons } from '@/components/admin/AdminSeedTestButtons';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useWorkspaceFavorites } from '@/hooks/useWorkspaceFavorites';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

// Lazy load workspaces for better code splitting
const OverviewDashboard = lazy(() => import('@/components/admin/OverviewDashboard').then(m => ({ default: m.OverviewDashboard })));
const AIPanel = lazy(() => import('@/components/admin/AIPanel'));
const CommandCenter = lazy(() => import('@/components/admin/workspaces/CommandCenter').then(m => ({ default: m.CommandCenter })));
const ServiceCatalogue = lazy(() => import('@/components/admin/workspaces/ServiceCatalogue').then(m => ({ default: m.ServiceCatalogue })));
const ProfessionalHub = lazy(() => import('@/components/admin/workspaces/ProfessionalHub').then(m => ({ default: m.ProfessionalHub })));
const ProfessionalAnalytics = lazy(() => import('@/components/admin/workspaces/ProfessionalAnalytics'));
const AISystemMonitor = lazy(() => import('@/components/admin/workspaces/AISystemMonitor'));
const RiskManagement = lazy(() => import('@/components/admin/workspaces/RiskManagement'));
const MarketIntelligence = lazy(() => import('@/components/admin/workspaces/MarketIntelligence'));

// Lazy load analytics components
const AdvancedAnalyticsDashboard = lazy(() => import('@/components/analytics/AdvancedAnalyticsDashboard').then(m => ({ default: m.AdvancedAnalyticsDashboard })));
const BusinessIntelligencePanel = lazy(() => import('@/components/analytics/BusinessIntelligencePanel').then(m => ({ default: m.BusinessIntelligencePanel })));
const ReportGenerator = lazy(() => import('@/components/analytics/ReportGenerator').then(m => ({ default: m.ReportGenerator })));
const AlertSystem = lazy(() => import('@/components/analytics/AlertSystem').then(m => ({ default: m.AlertSystem })));
const SystemHealthMonitor = lazy(() => import('@/components/analytics/SystemHealthMonitor').then(m => ({ default: m.SystemHealthMonitor })));

// Lazy load admin tools
const UserInspector = lazy(() => import('@/components/admin/UserInspector'));
const AdminDocumentReview = lazy(() => import('@/components/admin/AdminDocumentReview').then(m => ({ default: m.AdminDocumentReview })));
const DatabaseStats = lazy(() => import('@/components/admin/DatabaseStats'));
const FeatureFlagsManager = lazy(() => import('@/components/admin/FeatureFlagsManager'));
const EnhancedPaymentManagement = lazy(() => import('@/components/admin/payments/EnhancedPaymentManagement').then(m => ({ default: m.EnhancedPaymentManagement })));
const ContentModerationPanel = lazy(() => import('@/components/admin/ContentModerationPanel'));
const UserAnalyticsDashboard = lazy(() => import('@/components/admin/UserAnalyticsDashboard'));
const SystemHealthDashboard = lazy(() => import('@/components/admin/SystemHealthDashboard').then(m => ({ default: m.SystemHealthDashboard })));
const PerformanceDashboard = lazy(() => import('@/components/admin/PerformanceDashboard').then(m => ({ default: m.PerformanceDashboard })));

// Lazy load AI components
const AISmartMatcher = lazy(() => import('@/components/ai/AISmartMatcher').then(m => ({ default: m.AISmartMatcher })));
const WorkflowAutomation = lazy(() => import('@/components/ai/WorkflowAutomation').then(m => ({ default: m.WorkflowAutomation })));

interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  roles: any;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

interface AdminDashboardProps {
  user: User;
  profile: Profile;
}

const AdminDashboard = ({ user, profile }: AdminDashboardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeWorkspace, setActiveWorkspace] = useState('overview');
  const [selectedView, setSelectedView] = useState('overview');
  const [aiContext, setAiContext] = useState<{ type: 'job' | 'professional' | 'service' | 'review' | 'overview' }>({ type: 'overview' });
  const infoTipsEnabled = useFeature('admin_info_tips');
  const { pendingCount } = usePendingVerifications();
  const { enabled: analyticsEnabled } = useFeatureFlag('analytics_v1');
  const [showTestTools, setShowTestTools] = useState(false);
  const { favorites, toggleFavorite, isFavorite } = useWorkspaceFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const workspaces = [
    { 
      id: 'overview', 
      name: 'Dashboard Home', 
      icon: Home, 
      description: 'KPIs & action queues',
      tooltip: 'Unified overview of platform health, risk monitors, and pending admin actions. Your control center.',
      category: 'core'
    },
    { 
      id: 'command', 
      name: 'Command Centre', 
      icon: Command, 
      description: 'Live jobs and operations',
      tooltip: 'Live view of all jobs. Reassign, broadcast, or resolve issues fast. Monitor platform activity in real-time.',
      category: 'core'
    },
    { 
      id: 'analytics', 
      name: 'Professional Analytics', 
      icon: Users, 
      description: 'Performance & earnings analytics',
      tooltip: 'Track professional performance metrics, earnings, completion rates, and quality scores across the platform.',
      category: 'analytics'
    },
    { 
      id: 'ai-monitor', 
      name: 'AI System Monitor', 
      icon: Bot, 
      description: 'AI functions & performance',
      tooltip: 'Monitor AI systems performance, function execution rates, error logs, and automated workflows.',
      category: 'ai'
    },
    { 
      id: 'risk', 
      name: 'Risk Management', 
      icon: Shield, 
      description: 'Risk flags & safety compliance',
      tooltip: 'Identify and manage platform risks, safety violations, compliance issues, and security threats.',
      category: 'operations'
    },
    { 
      id: 'market', 
      name: 'Market Intelligence', 
      icon: TrendingUp, 
      description: 'Market analysis & opportunities',
      tooltip: 'Analyze market trends, pricing patterns, demand forecasts, and growth opportunities across Ibiza.',
      category: 'analytics'
    },
    ...(analyticsEnabled ? [{
      id: 'dispute-analytics',
      name: 'Dispute Analytics',
      icon: AlertTriangle,
      description: 'KPIs, warnings & quality',
      tooltip: 'Monitor dispute resolution metrics, early warnings, and quality scores. Track platform mediation performance.',
      category: 'analytics'
    }] : []),
    { 
      id: 'professionals', 
      name: 'Professional Hub', 
      icon: Users, 
      description: 'Professional management',
      tooltip: 'Manage professional profiles, verification status, skills, availability, and performance reviews.',
      category: 'operations'
    },
    { 
      id: 'verifications', 
      name: 'Verifications', 
      icon: FileCheck, 
      description: 'Verify professionals',
      tooltip: 'Review and approve professional verification requests. Manage verification documents and status.',
      badge: pendingCount > 0 ? pendingCount : undefined,
      category: 'operations'
    },
    { 
      id: 'helpdesk', 
      name: 'Support Helpdesk', 
      icon: Activity, 
      description: 'Manage support tickets',
      tooltip: 'Handle customer support tickets with SLA tracking, internal notes, and assignment management.',
      category: 'operations'
    },
    { 
      id: 'moderation', 
      name: 'Review Moderation', 
      icon: AlertTriangle, 
      description: 'Moderate reviews & flags',
      tooltip: 'Review flagged content, moderate user reviews, and manage content compliance.',
      category: 'operations'
    },
    { 
      id: 'export-reports', 
      name: 'Data Exports', 
      icon: FileCheck, 
      description: 'Generate reports',
      tooltip: 'Export platform data in CSV, JSON, or PDF format with audit logging.',
      category: 'tools'
    },
    { 
      id: 'security', 
      name: 'Security Settings', 
      icon: Shield, 
      description: '2FA & access control',
      tooltip: 'Manage two-factor authentication, sessions, and IP whitelisting.',
      category: 'settings'
    },
    { 
      id: 'intelligence', 
      name: 'AI Intelligence', 
      icon: Brain, 
      description: 'Fraud & predictions',
      tooltip: 'Fraud detection, performance scoring, revenue forecasts, and churn predictions.',
      category: 'ai'
    },
    { 
      id: 'integrations', 
      name: 'Integrations', 
      icon: Bot, 
      description: 'External services',
      tooltip: 'Connect Stripe, calendars, email, SMS, and webhook services.',
      category: 'settings'
    },
    { 
      id: 'performance', 
      name: 'Performance Monitor', 
      icon: Activity, 
      description: 'System performance',
      tooltip: 'Monitor background jobs, cache performance, and system health.',
      category: 'tools'
    },
    { 
      id: 'system-health', 
      name: 'System Health', 
      icon: Activity, 
      description: 'Health checks & errors',
      tooltip: 'Monitor system health checks, edge function errors, and service availability.',
      category: 'tools'
    },
    { 
      id: 'services', 
      name: 'Service Catalogue', 
      icon: Folder, 
      description: 'Manage service taxonomy',
      tooltip: 'Configure service categories, pricing structures, and requirements. Update service offerings and descriptions.',
      category: 'operations'
    },
    { 
      id: 'legacy', 
      name: 'Legacy Tools', 
      icon: Settings, 
      description: 'Original admin tools',
      tooltip: 'Access original administrative tools and legacy functions for backward compatibility.',
      category: 'tools'
    },
    { 
      id: 'business-analytics', 
      name: 'Analytics Dashboard', 
      icon: TrendingUp, 
      description: 'Advanced analytics & BI',
      tooltip: 'Deep dive into business metrics, revenue analytics, user behavior patterns, and performance KPIs.',
      category: 'analytics'
    },
    { 
      id: 'business-intelligence', 
      name: 'Business Intelligence', 
      icon: Bot, 
      description: 'AI-powered insights',
      tooltip: 'AI-generated business insights, predictive analytics, and automated recommendations for platform optimization.',
      category: 'ai'
    },
    { 
      id: 'reports', 
      name: 'Report Generator', 
      icon: CreditCard, 
      description: 'Automated reporting',
      tooltip: 'Generate automated reports for stakeholders, financial summaries, and operational metrics.',
      category: 'tools'
    },
    { 
      id: 'alerts', 
      name: 'Alert System', 
      icon: Shield, 
      description: 'Business alerts & monitoring',
      tooltip: 'Configure and monitor business alerts, threshold warnings, and automated notifications.',
      category: 'tools'
    },
    { 
      id: 'ai-automation', 
      name: 'AI Automation', 
      icon: Bot, 
      description: 'Smart matching & automation',
      tooltip: 'Configure AI-powered job matching, workflow automation, and intelligent routing systems.',
      category: 'ai'
    },
    { 
      id: 'payments', 
      name: 'Payment Management', 
      icon: CreditCard, 
      description: 'Manage transactions & disputes',
      tooltip: 'Oversee payment transactions, approve refunds, resolve disputes, and monitor financial operations.',
      category: 'finance'
    },
    { 
      id: 'content-moderation', 
      name: 'Content Moderation', 
      icon: Shield, 
      description: 'Review flagged content',
      tooltip: 'Review and moderate user-reported content, spam, and policy violations.',
      category: 'operations'
    },
    { 
      id: 'user-analytics', 
      name: 'User Analytics', 
      icon: Users, 
      description: 'User cohorts & activity',
      tooltip: 'Analyze user cohorts, activity patterns, retention metrics, and engagement data.',
      category: 'analytics'
    },
  ];

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      description: 'Search workspaces',
      callback: () => setSearchQuery(prev => prev ? '' : 'focus'),
    },
    {
      key: 'h',
      ctrl: true,
      description: 'Go to dashboard home',
      callback: () => setActiveWorkspace('overview'),
    },
    {
      key: 's',
      ctrl: true,
      description: 'Go to system health',
      callback: () => setActiveWorkspace('system-health'),
    },
    {
      key: 'c',
      ctrl: true,
      description: 'Go to command centre',
      callback: () => setActiveWorkspace('command'),
    },
  ]);

  // Filter workspaces
  const filteredWorkspaces = workspaces.filter(w => {
    const matchesSearch = !searchQuery || 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || w.category === activeCategory;
    const matchesFavorites = activeCategory !== 'favorites' || favorites.includes(w.id);
    
    return matchesSearch && matchesCategory && (activeCategory === 'favorites' ? matchesFavorites : true);
  });

  const categories = [
    { id: 'all', label: 'All', count: workspaces.length },
    { id: 'favorites', label: 'Favorites', count: favorites.length },
    { id: 'core', label: 'Core', count: workspaces.filter(w => w.category === 'core').length },
    { id: 'analytics', label: 'Analytics', count: workspaces.filter(w => w.category === 'analytics').length },
    { id: 'operations', label: 'Operations', count: workspaces.filter(w => w.category === 'operations').length },
    { id: 'ai', label: 'AI', count: workspaces.filter(w => w.category === 'ai').length },
    { id: 'finance', label: 'Finance', count: workspaces.filter(w => w.category === 'finance').length },
    { id: 'tools', label: 'Tools', count: workspaces.filter(w => w.category === 'tools').length },
    { id: 'settings', label: 'Settings', count: workspaces.filter(w => w.category === 'settings').length },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out", 
      description: "You've been signed out successfully.",
    });
  };

  // Extra safety check (though it should be handled in AdminDashboardPage)
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Profile data not available</p>
      </div>
    );
  }

  const renderWorkspaceContent = () => {
    const content = (() => {
      switch (activeWorkspace) {
        case 'overview':
          return <OverviewDashboard />;
        case 'command':
          return <CommandCenter />;
        case 'analytics':
          return <ProfessionalAnalytics />;
        case 'ai-monitor':
          return <AISystemMonitor />;
        case 'risk':
          return <RiskManagement />;
        case 'market':
          return <MarketIntelligence />;
        case 'dispute-analytics':
          navigate('/admin/analytics/disputes');
          return null;
        case 'professionals':
          return <ProfessionalHub />;
        case 'verifications':
          navigate('/admin/verifications');
          return null;
        case 'helpdesk':
          navigate('/admin/helpdesk');
          return null;
        case 'moderation':
          navigate('/admin/moderation/reviews');
          return null;
        case 'export-reports':
          navigate('/admin/reports');
          return null;
        case 'security':
          navigate('/admin/security');
          return null;
        case 'intelligence':
          navigate('/admin/intelligence');
          return null;
        case 'integrations':
          navigate('/admin/integrations');
          return null;
        case 'performance':
          navigate('/admin/performance');
          return null;
        case 'system-health':
          return <SystemHealthDashboard />;
        case 'performance':
          return <PerformanceDashboard />;
        case 'services':
          return <ServiceCatalogue />;
        case 'legacy':
          return <div className="p-6 text-center text-muted-foreground">Legacy dashboard components will be available here.</div>;
        case 'business-analytics':
          return <AdvancedAnalyticsDashboard />;
        case 'business-intelligence':
          return <BusinessIntelligencePanel />;
        case 'reports':
          return <ReportGenerator />;
        case 'alerts':
          return <AlertSystem />;
        case 'system-health':
          return <SystemHealthMonitor />;
        case 'ai-automation':
          return (
            <div className="space-y-6">
              <AISmartMatcher jobId="sample-job-id" />
              <WorkflowAutomation />
            </div>
          );
        case 'payments':
          return <EnhancedPaymentManagement />;
        case 'content-moderation':
          return <ContentModerationPanel />;
        case 'user-analytics':
          return <UserAnalyticsDashboard />;
        default:
          return <OverviewDashboard />;
      }
    })();

    // Wrap all lazy-loaded components in ErrorBoundary and Suspense
    if (activeWorkspace !== 'legacy') {
      return (
        <ErrorBoundary>
          <Suspense fallback={<SkeletonLoader variant="dashboard" />}>
            {content}
          </Suspense>
        </ErrorBoundary>
      );
    }
    
    return content;
  };

  const AppSidebar = () => (
    <Sidebar className="w-72">
      <SidebarContent>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-semibold">Admin Console</h2>
              <p className="text-xs text-muted-foreground">
                {profile.full_name || user.email}
              </p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workspaces (⌘K)"
              value={searchQuery === 'focus' ? '' : searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-9 px-2">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="core" className="text-xs">Core</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Secondary Categories */}
        <div className="flex flex-wrap gap-1 px-2 py-2 border-b">
          {categories.slice(3).map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label} ({cat.count})
            </Button>
          ))}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>
            {activeCategory === 'all' && 'All Workspaces'}
            {activeCategory === 'favorites' && 'Favorite Workspaces'}
            {activeCategory !== 'all' && activeCategory !== 'favorites' && 
              `${categories.find(c => c.id === activeCategory)?.label} Workspaces`}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredWorkspaces.map((workspace) => (
                <SidebarMenuItem key={workspace.id}>
                  <SidebarMenuButton 
                    onClick={() => {
                      setActiveWorkspace(workspace.id);
                      setAiContext({ 
                        type: workspace.id === 'command' ? 'job' : 
                             workspace.id === 'professionals' ? 'professional' :
                             workspace.id === 'services' ? 'service' : 'overview' 
                      });
                    }}
                    className={activeWorkspace === workspace.id ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <workspace.icon className="h-4 w-4" />
                    <div className="flex flex-col items-start flex-1">
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-sm font-medium">{workspace.name}</span>
                        {workspace.badge && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                            {workspace.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{workspace.description}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(workspace.id);
                      }}
                    >
                      <Star 
                        className={`h-3 w-3 ${isFavorite(workspace.id) ? 'fill-yellow-400 text-yellow-400' : ''}`}
                      />
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Hide sidebar on mobile */}
        <div className="hidden lg:block">
          <AppSidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 lg:px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <div>
                    <h1 className="text-xl font-semibold text-foreground">
                      {workspaces.find(w => w.id === activeWorkspace)?.name || 'Admin Dashboard'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {workspaces.find(w => w.id === activeWorkspace)?.description || 'Platform Administration'}
                    </p>
                  </div>
                  {infoTipsEnabled && (
                    <InfoTip
                      content={workspaces.find(w => w.id === activeWorkspace)?.tooltip || 'Administrative workspace for platform management'}
                      side="bottom"
                      align="start"
                      maxWidth="max-w-sm"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="destructive" className="text-xs">Admin</Badge>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content with AI Panel */}
          <div className="flex-1 flex gap-6">
            <main className="flex-1 p-4 lg:p-6 overflow-auto">
              {renderWorkspaceContent()}
            </main>
            
            {/* Right Sidebar: AI Panel + Warnings - Hide on mobile */}
            <div className="hidden lg:block w-80 border-l p-4 space-y-4 overflow-auto">
              {analyticsEnabled && (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Active Warnings
                    </h3>
                    <EarlyWarningPanel compact />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTestTools(!showTestTools)}
                    className="w-full"
                  >
                    {showTestTools ? 'Hide' : 'Show'} Test Tools
                  </Button>
                  
                  {showTestTools && (
                    <div className="mt-4">
                      <AdminSeedTestButtons />
                    </div>
                  )}
                </>
              )}
              <AIPanel context={aiContext} />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;