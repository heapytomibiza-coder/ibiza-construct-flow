import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileErrorProps {
  error?: string;
  onRetry?: () => void;
}

export const ProfileError = ({
  error = 'Failed to load professional profile',
  onRetry
}: ProfileErrorProps) => {
  const navigate = useNavigate();

  return (
    <div className="container pt-32 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-destructive/50">
          <CardContent className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onRetry && (
                <Button onClick={onRetry} size="lg" className="touch-target">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/discovery')}
                className="touch-target"
              >
                <Home className="w-4 h-4 mr-2" />
                Browse Professionals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
