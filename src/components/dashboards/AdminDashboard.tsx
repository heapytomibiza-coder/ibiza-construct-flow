import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Bot, Command, Folder, Users, CreditCard, Shield, Settings, Home, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AIPanel from '@/components/admin/AIPanel';
import { CommandCenter } from '@/components/admin/workspaces/CommandCenter';
import { ServiceCatalogue } from '@/components/admin/workspaces/ServiceCatalogue';
import { ProfessionalHub } from '@/components/admin/workspaces/ProfessionalHub';
import ProfessionalAnalytics from '@/components/admin/workspaces/ProfessionalAnalytics';
import AISystemMonitor from '@/components/admin/workspaces/AISystemMonitor';
import RiskManagement from '@/components/admin/workspaces/RiskManagement';
import MarketIntelligence from '@/components/admin/workspaces/MarketIntelligence';
import AdminDashboardTabs from '@/components/admin/AdminDashboardTabs';

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
  const [activeWorkspace, setActiveWorkspace] = useState('command');
  const [aiContext, setAiContext] = useState<{ type: 'job' | 'professional' | 'service' | 'review' | 'overview' }>({ type: 'overview' });

  const workspaces = [
    { id: 'command', name: 'Command Centre', icon: Command, description: 'Live jobs and operations' },
    { id: 'analytics', name: 'Professional Analytics', icon: Users, description: 'Performance & earnings analytics' },
    { id: 'ai-monitor', name: 'AI System Monitor', icon: Bot, description: 'AI functions & performance' },
    { id: 'risk', name: 'Risk Management', icon: Shield, description: 'Risk flags & safety compliance' },
    { id: 'market', name: 'Market Intelligence', icon: TrendingUp, description: 'Market analysis & opportunities' },
    { id: 'professionals', name: 'Professional Hub', icon: Users, description: 'Professional management' },
    { id: 'services', name: 'Service Catalogue', icon: Folder, description: 'Manage service taxonomy' },
    { id: 'legacy', name: 'Legacy Tools', icon: Settings, description: 'Original admin tools' }
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
      case 'services':
        return <ServiceCatalogue />;
      case 'legacy':
        return <AdminDashboardTabs />;
      default:
        return <CommandCenter />;
    }
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
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{workspace.name}</span>
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
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {workspaces.find(w => w.id === activeWorkspace)?.name || 'Admin Dashboard'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {workspaces.find(w => w.id === activeWorkspace)?.description || 'Platform Administration'}
                  </p>
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