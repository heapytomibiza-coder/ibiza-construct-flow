import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface DemoModeButtonProps {
  onStartHomeTour: () => void;
  onStartWizardTour: () => void;
  onResetAllTours: () => void;
}

export function DemoModeButton({
  onStartHomeTour,
  onStartWizardTour,
  onResetAllTours,
}: DemoModeButtonProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleQuickLaunch = useCallback(() => {
    const path = location.pathname;
    
    if (path === '/') {
      onStartHomeTour();
      toast.success('Homepage tour started', { duration: 2000 });
    } else if (path === '/post') {
      onStartWizardTour();
      toast.success('Job wizard tour started', { duration: 2000 });
    } else {
      // Navigate to homepage and start tour
      navigate('/');
      setTimeout(() => {
        onStartHomeTour();
        toast.success('Homepage tour started', { duration: 2000 });
      }, 500);
    }
  }, [location.pathname, onStartHomeTour, onStartWizardTour, navigate]);

  const handleResetTours = () => {
    onResetAllTours();
    toast.success('All tours reset', {
      description: 'Tours will show again on next visit',
      duration: 3000,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 font-medium"
        >
          <Play className="w-4 h-4" />
          Demo Mode
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleQuickLaunch}>
          <Play className="w-4 h-4 mr-2" />
          Launch Tour (Current Page)
          <span className="ml-auto text-xs text-muted-foreground">
            Shift + ?
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onStartHomeTour}>
          Homepage Tour
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onStartWizardTour}>
          Job Wizard Tour
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleResetTours}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All Tours
          <span className="ml-auto text-xs text-muted-foreground">
            Shift + Ctrl + R
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
