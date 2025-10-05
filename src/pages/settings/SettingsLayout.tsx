import { Outlet, NavLink } from 'react-router-dom';
import { User, Shield, Bell, Home, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRole } from '@/lib/roleHelpers';

export default function SettingsLayout() {
  const { roles } = useRole();
  
  const allLinks = [
    // Everyone gets these
    { to: "/settings/profile", label: "Profile", icon: User, roles: ['all'] },
    { to: "/settings/account", label: "Account", icon: Shield, roles: ['all'] },
    { to: "/settings/notifications", label: "Notifications", icon: Bell, roles: ['all'] },
    
    // Role-specific
    { to: "/settings/client", label: "Client", icon: Home, roles: ['client'] },
    { to: "/settings/professional", label: "Professional", icon: Briefcase, roles: ['professional'] },
  ];
  
  // Filter links based on user's roles
  const visibleLinks = allLinks.filter(link => 
    link.roles.includes('all') || 
    link.roles.some(role => roles.includes(role as any))
  );
  
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <Card className="h-max rounded-2xl p-2">
            <nav className="flex flex-col gap-1">
              {visibleLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `
                    flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                    transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </Card>
          
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
