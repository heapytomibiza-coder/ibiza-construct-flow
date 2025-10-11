import { useState, useEffect } from 'react';
import { WizardCalculator } from './layouts/WizardCalculator';
import { SinglePageCalculator } from './layouts/SinglePageCalculator';
import { ViewModeToggle } from './ui/ViewModeToggle';
import { useCalculatorAnalytics } from '@/hooks/useCalculatorAnalytics';

export function ProjectCalculator() {
  const [viewMode, setViewMode] = useState<'wizard' | 'single'>(() => {
    // Check URL params first
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    if (urlMode === 'wizard' || urlMode === 'single') return urlMode;
    
    // Check localStorage preference
    const stored = localStorage.getItem('calculator_view_mode');
    return stored === 'single' ? 'single' : 'wizard';
  });

  const [sessionToken] = useState(() => {
    const stored = localStorage.getItem('calculator_session');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.sessionToken;
      } catch {
        return crypto.randomUUID();
      }
    }
    return crypto.randomUUID();
  });

  const { trackEvent } = useCalculatorAnalytics(sessionToken);

  const handleModeChange = (mode: 'wizard' | 'single') => {
    setViewMode(mode);
    localStorage.setItem('calculator_view_mode', mode);
    
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set('mode', mode);
    window.history.replaceState({}, '', url);

    // Track mode change
    trackEvent('view_mode_changed', { scopeBundles: [], adders: [], dismissedTips: [] }, undefined, { 
      new_mode: mode 
    });
  };

  // Check for "new" param to reset
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === 'true') {
      localStorage.removeItem('calculator_session');
      // Remove the param
      params.delete('new');
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const maxWidth = viewMode === 'wizard' ? 'max-w-4xl' : 'max-w-7xl';

  return (
    <div className="min-h-screen bg-[#13111F] py-12">
      <div className={`container ${maxWidth} mx-auto px-4`}>
        {/* Header with mode toggle */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Calculator</h1>
            <p className="text-muted-foreground">
              Estimate your renovation project costs and timeline
            </p>
          </div>
          <ViewModeToggle value={viewMode} onChange={handleModeChange} />
        </div>

        {/* Render based on mode */}
        {viewMode === 'wizard' ? (
          <WizardCalculator />
        ) : (
          <SinglePageCalculator />
        )}
      </div>
    </div>
  );
}
