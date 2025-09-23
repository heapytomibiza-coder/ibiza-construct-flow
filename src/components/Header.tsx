import { useState } from 'react';
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
import AuthModal from '@/components/auth/AuthModal';
import HeaderRoleSwitcher from '@/components/header/HeaderRoleSwitcher';

interface HeaderProps {
  jobWizardEnabled?: boolean;
  proInboxEnabled?: boolean;
}

const Header = ({ jobWizardEnabled = false, proInboxEnabled = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'signin' | 'signup'>('signin');
  const { user, profile, signOut, isAdmin, isProfessional, isClient } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin()) return '/dashboard/admin';
    if (isProfessional()) return '/dashboard/pro';
    if (isClient()) return '/dashboard/client';
    return '/dashboard';
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-sand-dark/20 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-display font-semibold text-charcoal text-lg">CS Ibiza</h1>
              <p className="text-xs text-muted-foreground -mt-1">Elite Network</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              Home
            </Link>
            <Link to="/services" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              Services
            </Link>
            <Link to="/professionals" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              Professionals
            </Link>
            <Link to="/how-it-works" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              How It Works
            </Link>
            <Link to="/contact" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              Contact
            </Link>
          </nav>

          {/* CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <HeaderRoleSwitcher />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">
                        {profile?.display_name || profile?.full_name || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
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
                  onClick={() => {
                    setAuthDefaultTab('signin');
                    setAuthModalOpen(true);
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => {
                    setAuthDefaultTab('signup');
                    setAuthModalOpen(true);
                  }}
                  className="bg-gradient-hero text-white"
                >
                  Join as Pro
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
              <Link to="/" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                Home
              </Link>
              <Link to="/services" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                Services
              </Link>
              <Link to="/professionals" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                Professionals
              </Link>
              <Link to="/how-it-works" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                How It Works
              </Link>
              <Link to="/contact" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                Contact
              </Link>
              <div className="flex flex-col space-y-3 pt-4">
                {user ? (
                  <>
                    <div className="flex justify-center py-2">
                      <HeaderRoleSwitcher />
                    </div>
                    <Link to={getDashboardPath()} className="btn-secondary">
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
                        setAuthDefaultTab('signin');
                        setAuthModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="w-full bg-gradient-hero text-white"
                      onClick={() => {
                        setAuthDefaultTab('signup');
                        setAuthModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      Join as Pro
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      
      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authDefaultTab}
      />
    </header>
  );
};

export default Header;