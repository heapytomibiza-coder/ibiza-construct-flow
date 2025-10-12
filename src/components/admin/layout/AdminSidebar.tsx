import { NavLink } from 'react-router-dom';
import { 
  Home, Users, Briefcase, Folder, MessageSquare, 
  AlertTriangle, Activity, FileText, Settings, BarChart3, Calendar,
  Database, Search as SearchIcon, Wrench, ShieldCheck, TestTube, Flag, FileQuestion
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { usePendingVerifications } from '@/hooks/admin';

const navigationItems = [
  {
    group: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin', description: 'Overview & metrics' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics', description: 'Reports & insights' },
      { id: 'database', label: 'Database', icon: Database, path: '/admin/database', description: 'Database statistics' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { id: 'users', label: 'Users', icon: Users, path: '/admin/users', description: 'User management' },
      { id: 'profiles', label: 'Profiles', icon: Users, path: '/admin/profiles', description: 'Verification queue' },
      { id: 'jobs', label: 'Jobs', icon: Briefcase, path: '/admin/jobs', description: 'Job & booking queue' },
      { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/admin/bookings', description: 'Booking management' },
      { id: 'services', label: 'Services', icon: Folder, path: '/admin/services', description: 'Service catalog' },
      { id: 'reviews', label: 'Reviews', icon: MessageSquare, path: '/admin/reviews', description: 'Moderation queue' },
      { id: 'disputes', label: 'Disputes', icon: AlertTriangle, path: '/admin/disputes', description: 'Resolution timeline' },
      { id: 'questions', label: 'Questions', icon: FileQuestion, path: '/admin/questions', description: 'Manage wizard questions' },
    ],
  },
  {
    group: 'Advanced Tools',
    items: [
      { id: 'user-inspector', label: 'User Inspector', icon: SearchIcon, path: '/admin/user-inspector', description: 'Deep user search' },
      { id: 'service-manager', label: 'Service Manager', icon: Wrench, path: '/admin/service-manager', description: 'Manage micro services' },
      { id: 'profile-moderation', label: 'Moderation', icon: ShieldCheck, path: '/admin/profile-moderation', description: 'Profile verification' },
      { id: 'documents', label: 'Documents', icon: FileText, path: '/admin/documents', description: 'Document review' },
      { id: 'feature-flags', label: 'Feature Flags', icon: Flag, path: '/admin/feature-flags', description: 'Toggle features' },
      { id: 'test-runner', label: 'Test Runner', icon: TestTube, path: '/admin/test-runner', description: 'AI system tests' },
    ],
  },
  {
    group: 'System',
    items: [
      { id: 'health', label: 'Health', icon: Activity, path: '/admin/health', description: 'Automated checks' },
      { id: 'audit', label: 'Audit', icon: FileText, path: '/admin/audit-log', description: 'Activity log' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings', description: 'Roles & flags' },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { data: pendingCount = 0 } = usePendingVerifications();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <div className="p-2">
        <SidebarTrigger className="w-full" />
      </div>
      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.group}>
            {!collapsed && <SidebarGroupLabel>{group.group}</SidebarGroupLabel>}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const showBadge = item.id === 'profiles' && pendingCount > 0;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                          }
                        >
                          <Icon className="h-4 w-4" />
                          {!collapsed && (
                            <div className="flex items-center justify-between flex-1">
                              <span>{item.label}</span>
                              {showBadge && (
                                <Badge variant="destructive" className="ml-auto">
                                  {pendingCount}
                                </Badge>
                              )}
                            </div>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
