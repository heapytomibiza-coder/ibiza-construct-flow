import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  Calendar, 
  MessageSquare, 
  User,
  Briefcase,
  Users,
  Settings
} from 'lucide-react';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useScrollHide } from '@/hooks/useScrollHide';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  badge?: number;
  roles?: string[];
}

export const MobileBottomNav = () => {
  const location = useLocation();
  const { activeRole } = useActiveRole();
  const { isVisible } = useScrollHide({ threshold: 10, hideDelay: 150 });

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { icon: Home, label: 'Home', href: '/dashboard' },
      { icon: Search, label: 'Services', href: '/services' },
    ];

    if (activeRole === 'professional') {
      return [
        ...baseItems,
        { icon: Briefcase, label: 'Jobs', href: '/professional-dashboard' },
        { icon: Calendar, label: 'Schedule', href: '/schedule' },
        { icon: User, label: 'Profile', href: '/profile' }
      ];
    }

    if (activeRole === 'client') {
      return [
        ...baseItems,
        { icon: Briefcase, label: 'My Jobs', href: '/client-dashboard' },
        { icon: MessageSquare, label: 'Messages', href: '/messages', badge: 2 },
        { icon: User, label: 'Profile', href: '/profile' }
      ];
    }

    if (activeRole === 'admin') {
      return [
        { icon: Home, label: 'Dashboard', href: '/admin-dashboard' },
        { icon: Users, label: 'Professionals', href: '/professionals' },
        { icon: Briefcase, label: 'Jobs', href: '/jobs' },
        { icon: MessageSquare, label: 'Messages', href: '/messages' },
        { icon: Settings, label: 'Settings', href: '/settings' }
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-t border-border md:hidden",
        "transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg transition-colors relative min-w-0 flex-1 min-h-[56px]",
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <div className="relative">
                <item.icon className={cn("w-5 h-5 mb-1", active && "animate-scale-in")} />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 w-4 h-4 p-0 flex items-center justify-center text-xs animate-pulse"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium truncate w-full text-center",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};