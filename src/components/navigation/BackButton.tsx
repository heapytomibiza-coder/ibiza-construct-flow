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
    // Use fallback path if provided, otherwise try to go back in history
    if (fallbackPath && fallbackPath !== '/') {
      navigate(fallbackPath);
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
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
