import { useState, lazy, Suspense } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Bot, Command, Folder, Users, CreditCard, Shield, Settings, Home, TrendingUp, Activity, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { InfoTip } from '@/components/ui/info-tip';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';
import { usePendingVerifications } from '@/hooks/usePendingVerifications';
import { useNavigate } from 'react-router-dom';

// Lazy load workspaces for better code splitting
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
  const [activeWorkspace, setActiveWorkspace] = useState('command');
  const [selectedView, setSelectedView] = useState('overview');
  const [aiContext, setAiContext] = useState<{ type: 'job' | 'professional' | 'service' | 'review' | 'overview' }>({ type: 'overview' });
  const infoTipsEnabled = useFeature('admin_info_tips');
  const { pendingCount } = usePendingVerifications();

  const workspaces = [
    { 
      id: 'command', 
      name: 'Command Centre', 
      icon: Command, 
      description: 'Live jobs and operations',
      tooltip: 'Live view of all jobs. Reassign, broadcast, or resolve issues fast. Monitor platform activity in real-time.'
    },
    { 
      id: 'analytics', 
      name: 'Professional Analytics', 
      icon: Users, 
      description: 'Performance & earnings analytics',
      tooltip: 'Track professional performance metrics, earnings, completion rates, and quality scores across the platform.'
    },
    { 
      id: 'ai-monitor', 
      name: 'AI System Monitor', 
      icon: Bot, 
      description: 'AI functions & performance',
      tooltip: 'Monitor AI systems performance, function execution rates, error logs, and automated workflows.'
    },
    { 
      id: 'risk', 
      name: 'Risk Management', 
      icon: Shield, 
      description: 'Risk flags & safety compliance',
      tooltip: 'Identify and manage platform risks, safety violations, compliance issues, and security threats.'
    },
    { 
      id: 'market', 
      name: 'Market Intelligence', 
      icon: TrendingUp, 
      description: 'Market analysis & opportunities',
      tooltip: 'Analyze market trends, pricing patterns, demand forecasts, and growth opportunities across Ibiza.'
    },
    { 
      id: 'professionals', 
      name: 'Professional Hub', 
      icon: Users, 
      description: 'Professional management',
      tooltip: 'Manage professional profiles, verification status, skills, availability, and performance reviews.'
    },
    { 
      id: 'verifications', 
      name: 'Verifications', 
      icon: FileCheck, 
      description: 'Verify professionals',
      tooltip: 'Review and approve professional verification requests. Manage verification documents and status.',
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    { 
      id: 'services', 
      name: 'Service Catalogue', 
      icon: Folder, 
      description: 'Manage service taxonomy',
      tooltip: 'Configure service categories, pricing structures, and requirements. Update service offerings and descriptions.'
    },
    { 
      id: 'legacy', 
      name: 'Legacy Tools', 
      icon: Settings, 
      description: 'Original admin tools',
      tooltip: 'Access original administrative tools and legacy functions for backward compatibility.'
    },
    { 
      id: 'business-analytics', 
      name: 'Analytics Dashboard', 
      icon: TrendingUp, 
      description: 'Advanced analytics & BI',
      tooltip: 'Deep dive into business metrics, revenue analytics, user behavior patterns, and performance KPIs.'
    },
    { 
      id: 'business-intelligence', 
      name: 'Business Intelligence', 
      icon: Bot, 
      description: 'AI-powered insights',
      tooltip: 'AI-generated business insights, predictive analytics, and automated recommendations for platform optimization.'
    },
    { 
      id: 'reports', 
      name: 'Report Generator', 
      icon: CreditCard, 
      description: 'Automated reporting',
      tooltip: 'Generate automated reports for stakeholders, financial summaries, and operational metrics.'
    },
    { 
      id: 'alerts', 
      name: 'Alert System', 
      icon: Shield, 
      description: 'Business alerts & monitoring',
      tooltip: 'Configure and monitor business alerts, threshold warnings, and automated notifications.'
    },
    { 
      id: 'ai-automation', 
      name: 'AI Automation', 
      icon: Bot, 
      description: 'Smart matching & automation',
      tooltip: 'Configure AI-powered job matching, workflow automation, and intelligent routing systems.'
    },
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
        case 'professionals':
          return <ProfessionalHub />;
        case 'verifications':
          // Navigate to dedicated verifications page
          navigate('/admin/verifications');
          return null;
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
        default:
          return <CommandCenter />;
      }
    })();

    // Wrap all lazy-loaded components in Suspense for better UX
    if (activeWorkspace !== 'legacy') {
      return (
        <Suspense fallback={<SkeletonLoader variant="dashboard" />}>
          {content}
        </Suspense>
      );
    }
    
    return content;
  };

  const AppSidebar = () => (
    <Sidebar className="w-64">
      <SidebarContent>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-semibold">Admin Console</h2>
              <p className="text-xs text-muted-foreground">
                {profile.full_name || user.email}
              </p>
            </div>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaces.map((workspace) => (
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
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-6 py-4">
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
          <div className="flex-1 flex">
            <main className="flex-1 p-6 overflow-auto">
              {renderWorkspaceContent()}
            </main>
            
            {/* AI Assistant Panel */}
            <AIPanel context={aiContext} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;