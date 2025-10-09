import { NavLink } from 'react-router-dom';
import { 
  Home, Users, Briefcase, Folder, MessageSquare, 
  AlertTriangle, Activity, FileText, Settings
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
import { usePendingVerifications } from '@/hooks/usePendingVerifications';

const navigationItems = [
  {
    group: 'Overview',
    items: [
      { id: 'home', label: 'Home', icon: Home, path: '/admin/home', description: 'Dashboard & health' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { id: 'profiles', label: 'Profiles', icon: Users, path: '/admin/profiles', description: 'Verification queue' },
      { id: 'jobs', label: 'Jobs', icon: Briefcase, path: '/admin/jobs', description: 'Job & booking queue' },
      { id: 'services', label: 'Services', icon: Folder, path: '/admin/services', description: 'Service catalog' },
      { id: 'reviews', label: 'Reviews', icon: MessageSquare, path: '/admin/reviews', description: 'Moderation queue' },
      { id: 'disputes', label: 'Disputes', icon: AlertTriangle, path: '/admin/disputes', description: 'Resolution timeline' },
    ],
  },
  {
    group: 'System',
    items: [
      { id: 'health', label: 'Health', icon: Activity, path: '/admin/health', description: 'Automated checks' },
      { id: 'audit', label: 'Audit', icon: FileText, path: '/admin/audit', description: 'Activity log' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings', description: 'Roles & flags' },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { pendingCount } = usePendingVerifications();
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
                              ? 'bg-accent text-accent-foreground font-medium'
                              : 'hover:bg-accent/50'
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
