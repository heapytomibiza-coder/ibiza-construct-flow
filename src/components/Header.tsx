import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Briefcase, Users, Phone, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useActiveRole } from '@/hooks/useActiveRole';
import HeaderRoleSwitcher from '@/components/header/HeaderRoleSwitcher';
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher';
import { MobileOptimizedHeader } from '@/components/mobile/MobileOptimizedHeader';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { Badge } from '@/components/ui/badge';
import { useConversationList } from '@/hooks/useConversationList';
import { MessageSquare } from 'lucide-react';
import { getDashboardForRole } from '@/lib/navigation';
import { DemoModeButton } from '@/components/tours/DemoModeButton';
import { useTourKeyboardShortcuts } from '@/hooks/useTourKeyboardShortcuts';
import { UserOnboardingTour } from '@/components/tours/UserOnboardingTour';

interface HeaderProps {
  jobWizardEnabled?: boolean;
  proInboxEnabled?: boolean;
}

const Header = ({ jobWizardEnabled = false, proInboxEnabled = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin, isProfessional, isClient } = useAuth();
  const { activeRole } = useActiveRole();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { totalUnread } = useConversationList(user?.id);

  // Tour management state
  const [tourTriggers, setTourTriggers] = useState({
    startHomeTour: () => {},
    startWizardTour: () => {},
    resetAllTours: () => {},
  });

  // Listen for tour trigger functions from pages
  useEffect(() => {
    const handleTourRegistration = (event: CustomEvent) => {
      setTourTriggers(prev => ({
        ...prev,
        [event.detail.key]: event.detail.trigger,
      }));
    };

    window.addEventListener('register-tour-trigger', handleTourRegistration as EventListener);
    return () => {
      window.removeEventListener('register-tour-trigger', handleTourRegistration as EventListener);
    };
  }, []);

  // Enable keyboard shortcuts globally
  useTourKeyboardShortcuts({
    onStartHomeTour: tourTriggers.startHomeTour,
    onStartWizardTour: tourTriggers.startWizardTour,
    onResetAllTours: tourTriggers.resetAllTours,
  });

  // Check if user is admin
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    if (user) {
      isAdmin().then(setIsAdminUser);
    } else {
      setIsAdminUser(false);
    }
  }, [user, isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dashboardPath = getDashboardForRole(activeRole || 'client');

  // Use mobile-optimized header on mobile devices
  if (isMobile) {
    return <MobileOptimizedHeader jobWizardEnabled={jobWizardEnabled} proInboxEnabled={proInboxEnabled} />;
  }

  return (
    <>
      <UserOnboardingTour />
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-sand-dark/20 z-50">
        <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-display font-semibold text-charcoal text-lg">CS Ibiza</h1>
              <p className="text-xs text-muted-foreground -mt-1">Elite Network</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/discovery" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              Discovery
            </Link>
            <Link to="/post" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              Post Project
            </Link>
            <Link to="/job-board" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              Job Board
            </Link>
            <Link to="/how-it-works" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              How It Works
            </Link>
          </nav>

          {/* CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            
            {/* Demo Mode Button - Admin Only, Desktop Only */}
            {isAdminUser && (
              <DemoModeButton
                onStartHomeTour={tourTriggers.startHomeTour}
                onStartWizardTour={tourTriggers.startWizardTour}
                onResetAllTours={tourTriggers.resetAllTours}
              />
            )}
            
            {user ? (
              <>
                <NotificationDropdown />
                {(isClient() || isProfessional()) && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="relative"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageSquare className="w-5 h-5" />
                    {totalUnread > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                      >
                        {totalUnread}
                      </Badge>
                    )}
                  </Button>
                )}
                <HeaderRoleSwitcher />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center space-x-2"
                      data-tour="user-profile"
                    >
                      <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {profile?.display_name || profile?.full_name || 'User'}
                        </span>
                        {activeRole && (
                          <Badge variant="secondary" className="text-xs capitalize mt-0.5">
                            {activeRole}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem 
                      onClick={() => navigate(dashboardPath)}
                      data-tour="dashboard-menu"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    {jobWizardEnabled && isClient() && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/post')}>
                          <Briefcase className="w-4 h-4 mr-2" />
                          Post Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/templates')}>
                          <Settings className="w-4 h-4 mr-2" />
                          Templates
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth?tab=signup')}
                className="bg-gradient-hero text-white"
              >
                Sign Up
              </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-charcoal hover:text-copper transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-sand-dark/20 pt-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/discovery" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                Discovery
              </Link>
              <Link to="/post" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                Post Project
              </Link>
              <Link to="/job-board" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                Job Board
              </Link>
              <Link to="/how-it-works" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                How It Works
              </Link>
              <div className="flex flex-col space-y-3 pt-4">
                <LanguageSwitcher />
                {user ? (
                  <>
                    <div className="flex justify-center py-2">
                      <HeaderRoleSwitcher />
                    </div>
                    <Link to={dashboardPath} className="btn-secondary">
                      Dashboard
                    </Link>
                    {jobWizardEnabled && isClient() && (
                      <>
                        <Link to="/post" className="btn-hero">
                          Post Project
                        </Link>
                        <Link to="/templates" className="btn-secondary">
                          Templates
                        </Link>
                      </>
                    )}
                    <Button onClick={handleSignOut} variant="outline" className="w-full">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        navigate('/auth');
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="w-full bg-gradient-hero text-white"
                      onClick={() => {
                        navigate('/auth?tab=signup');
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      </header>
    </>
  );
};

export default Header;