import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface TourShortcutsConfig {
  onStartHomeTour: () => void;
  onStartWizardTour: () => void;
  onResetAllTours: () => void;
}

/**
 * Global keyboard shortcuts for tour system
 * Shift + ? = Launch tour for current page
 * Shift + Ctrl + R = Reset all tours
 */
export function useTourKeyboardShortcuts({
  onStartHomeTour,
  onStartWizardTour,
  onResetAllTours,
}: TourShortcutsConfig) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Fully disable tours/shortcuts on mobile.
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + ? = Launch tour for current page
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();

        const path = location.pathname;
        if (path === '/') {
          onStartHomeTour();
          toast.success('Homepage tour started');
        } else if (path === '/post') {
          onStartWizardTour();
          toast.success('Job wizard tour started');
        } else {
          navigate('/');
          setTimeout(() => {
            onStartHomeTour();
            toast.success('Homepage tour started');
          }, 500);
        }
      }

      // Shift + Ctrl + R = Reset all tours
      if (e.shiftKey && e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        onResetAllTours();
        toast.success('All tours reset');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, location.pathname, onStartHomeTour, onStartWizardTour, onResetAllTours, navigate]);
}
