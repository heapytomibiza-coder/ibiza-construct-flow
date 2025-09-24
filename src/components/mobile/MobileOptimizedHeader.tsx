import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut,
  Home,
  Briefcase,
  Users,
  Calendar,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActiveRole } from '@/hooks/useActiveRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MobileOptimizedHeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  className?: string;
}

export const MobileOptimizedHeader = ({ 
  title = "Dashboard", 
  showSearch = true, 
  showNotifications = true,
  className = ""
}: MobileOptimizedHeaderProps) => {
  const { user } = useAuth();
  const { activeRole } = useActiveRole();
  const [notificationCount, setNotificationCount] = useState(3);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Briefcase, label: 'Jobs', href: '/jobs' },
    { icon: Users, label: 'Professionals', href: '/professionals' },
    { icon: Calendar, label: 'Schedule', href: '/schedule' },
    { icon: MessageSquare, label: 'Messages', href: '/messages' },
    { icon: CreditCard, label: 'Payments', href: '/payments' },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu and Title */}
        <div className="flex items-center space-x-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user?.email}</p>
                      <Badge variant="secondary" className="text-xs">
                        {activeRole}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                  <div className="space-y-2">
                    {navigationItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{item.label}</span>
                      </a>
                    ))}
                  </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border space-y-2">
                  <a
                    href="/settings"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Settings</span>
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors w-full text-left"
                  >
                    <LogOut className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="font-semibold text-lg md:text-xl truncate">{title}</h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {showSearch && (
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Search className="w-4 h-4" />
            </Button>
          )}

          {showNotifications && (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs animate-pulse"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          )}

          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </header>
  );
};