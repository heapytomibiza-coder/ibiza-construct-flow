import { ReactNode } from 'react';
import { QuickActions } from '@/components/navigation/QuickActions';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Settings, 
  BarChart3, 
  Bell, 
  User,
  LogOut 
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Home className="w-6 h-6" />
              <span className="hidden sm:inline">Platform</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-4">
              <Link 
                to="/analytics" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
              <Link 
                to="/notifications" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell className="w-4 h-4" />
                Notifications
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <QuickActions />
            
            {user ? (
              <>
                <Link to="/settings">
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Platform. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/settings" className="hover:text-foreground transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
