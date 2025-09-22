import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, Briefcase, Users, Phone } from 'lucide-react';

interface HeaderProps {
  jobWizardEnabled?: boolean;
  proInboxEnabled?: boolean;
}

const Header = ({ jobWizardEnabled = false, proInboxEnabled = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <a href="/" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              Home
            </a>
            <a href="/services" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              Services
            </a>
            <a href="/professionals" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              Professionals
            </a>
            <a href="/how-it-works" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              How It Works
            </a>
            <a href="/contact" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
              Contact
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {proInboxEnabled && (
              <Link to="/auth" className="btn-secondary">
                Join as Pro
              </Link>
            )}
            {jobWizardEnabled && (
              <Link to="/auth" className="btn-hero">
                Post Project
              </Link>
            )}
            {!jobWizardEnabled && !proInboxEnabled && (
              <Link to="/auth" className="btn-secondary">
                Sign In
              </Link>
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
              <a href="/" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                Home
              </a>
              <a href="/services" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                Services
              </a>
              <a href="/professionals" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                Professionals
              </a>
              <a href="/how-it-works" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                How It Works
              </a>
              <a href="/contact" className="text-body font-medium text-charcoal hover:text-copper transition-all duration-300">
                Contact
              </a>
              <div className="flex flex-col space-y-3 pt-4">
                {proInboxEnabled && (
                  <Link to="/auth" className="btn-secondary">
                    Join as Pro
                  </Link>
                )}
                {jobWizardEnabled && (
                  <Link to="/auth" className="btn-hero">
                    Post Project
                  </Link>
                )}
                {!jobWizardEnabled && !proInboxEnabled && (
                  <Link to="/auth" className="btn-secondary">
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;