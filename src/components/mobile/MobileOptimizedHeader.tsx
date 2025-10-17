import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Search, User, Bell, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSafeArea } from '@/components/mobile/SafeAreaProvider';
import { cn } from '@/lib/utils';
import AuthModal from '@/components/auth/AuthModal';
import HeaderRoleSwitcher from '@/components/header/HeaderRoleSwitcher';
import { useTranslation } from 'react-i18next';

interface MobileOptimizedHeaderProps {
  jobWizardEnabled?: boolean;
  proInboxEnabled?: boolean;
}

export const MobileOptimizedHeader = ({ 
  jobWizardEnabled = false, 
  proInboxEnabled = false 
}: MobileOptimizedHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'signin' | 'signup'>('signin');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, profile, signOut, isAdmin, isProfessional, isClient } = useAuth();
  const isMobile = useIsMobile();
  const { insets } = useSafeArea();
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (isAdmin()) return '/admin';
    if (isProfessional()) return '/dashboard/pro';  
    if (isClient()) return '/dashboard/client';
    return '/dashboard';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  if (!isMobile) return null;

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-[100]",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",  
          "border-b border-border"
        )}
        style={{ paddingTop: `${insets.top}px` }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between min-h-[44px]">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">CS Ibiza</h1>
                <p className="text-xs text-muted-foreground -mt-0.5">Elite Network</p>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="w-10 h-10 p-0"
              >
                <Search className="w-4 h-4" />
              </Button>
              
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 p-0"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <form onSubmit={handleSearch} className="mt-3 animate-in slide-in-from-top-2">
              <Input
                type="search"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10"
                autoFocus
              />
            </form>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-border bg-background animate-in slide-in-from-top-2">
            <nav className="px-4 py-4">
              {/* User Section */}
              {user ? (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {profile?.display_name || profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <HeaderRoleSwitcher />
                </div>
              ) : (
                <div className="mb-4 space-y-2">
                  <Button 
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow"
                    onClick={() => {
                      setAuthDefaultTab('signup');
                      setAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    Join as Pro
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => {
                      setAuthDefaultTab('signin');
                      setAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                {/* Discover - Collapsible with nested Services & Professionals */}
                <Accordion type="single" collapsible className="border-none">
                  <AccordionItem value="discover" className="border-none">
                    <AccordionTrigger className="px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted hover:no-underline">
                      {t('discovery')}
                    </AccordionTrigger>
                    <AccordionContent className="pl-3 space-y-1 pb-0">
                      <Link 
                        to="/services" 
                        className="block px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('services')}
                      </Link>
                      <Link 
                        to="/professionals" 
                        className="block px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('professionals')}
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Top-level links */}
                <Link 
                  to="/post" 
                  className="block px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('postProject')}
                </Link>
                <Link 
                  to="/job-board" 
                  className="block px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('jobBoard')}
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="block px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('howItWorks')}
                </Link>
              </div>

              {/* User Actions */}
              {user && (
                <div className="mt-4 pt-4 border-t border-border space-y-1">
                  <Link 
                    to={getDashboardPath()} 
                    className="flex items-center px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Dashboard
                  </Link>
                  
                  {jobWizardEnabled && isClient() && (
                    <Link 
                      to="/post" 
                      className="flex items-center px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home className="w-4 h-4 mr-3" />
                      Post Project
                    </Link>
                  )}
                  
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <X className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authDefaultTab}
      />
    </>
  );
};