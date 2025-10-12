import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

type ConsentState = 'all' | 'essential' | null;

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(null);

  useEffect(() => {
    // Check if user has already made a choice
    const storedConsent = localStorage.getItem('cookie-consent') as ConsentState;
    if (storedConsent) {
      setConsent(storedConsent);
      // Apply analytics based on consent
      if (storedConsent === 'all') {
        enableAnalytics();
      }
    } else {
      // Show banner after a brief delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setConsent('all');
    localStorage.setItem('cookie-consent', 'all');
    enableAnalytics();
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    setConsent('essential');
    localStorage.setItem('cookie-consent', 'essential');
    disableAnalytics();
    setIsVisible(false);
  };

  const enableAnalytics = () => {
    // GA4 will be initialized here when implemented
    // For now, just set a flag that can be checked
    window.localStorage.setItem('analytics-enabled', 'true');
    console.log('✅ Analytics enabled');
  };

  const disableAnalytics = () => {
    window.localStorage.setItem('analytics-enabled', 'false');
    console.log('🚫 Analytics disabled');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <Card className="max-w-4xl mx-auto bg-card/95 backdrop-blur-sm border-2 shadow-lg">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-semibold">Cookie Preferences</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use cookies to enhance your experience, provide essential platform functionality, 
                and understand how you use our service (with your consent). Essential cookies are required 
                for authentication and security. Analytics cookies help us improve the platform.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={handleAcceptAll}
                  size="sm"
                  className="font-medium"
                >
                  Accept All
                </Button>
                <Button
                  onClick={handleEssentialOnly}
                  variant="outline"
                  size="sm"
                  className="font-medium"
                >
                  Essential Only
                </Button>
                <Link to="/cookie-policy" className="inline-block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium text-muted-foreground"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
