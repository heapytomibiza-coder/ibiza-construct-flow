import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  fallbackPath?: string;
}

export const BackButton = ({ 
  className, 
  variant = 'ghost',
  fallbackPath = '/' 
}: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home or specified path
      navigate(fallbackPath);
    }
  };

  // Don't show on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleBack}
      className={cn('gap-2', className)}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Back</span>
    </Button>
  );
};
