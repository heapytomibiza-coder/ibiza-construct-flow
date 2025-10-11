import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SessionIndicatorProps {
  onStartOver: () => void;
  lastAccessed?: string;
}

export function SessionIndicator({ onStartOver, lastAccessed }: SessionIndicatorProps) {
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Continuing from your previous session
          {lastAccessed && ` (saved ${getTimeAgo(lastAccessed)})`}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onStartOver}
          className="ml-4"
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Start Over
        </Button>
      </AlertDescription>
    </Alert>
  );
}
