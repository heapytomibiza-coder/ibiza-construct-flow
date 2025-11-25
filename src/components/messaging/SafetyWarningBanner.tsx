import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SpamKeyword } from '@/types/messaging';

interface SafetyWarningBannerProps {
  matches: SpamKeyword[];
  severity: 'warning' | 'block';
}

export const SafetyWarningBanner = ({ matches, severity }: SafetyWarningBannerProps) => {
  const isBlock = severity === 'block';
  
  return (
    <Alert variant={isBlock ? 'destructive' : 'default'} className="mb-4">
      <div className="flex items-start gap-3">
        {isBlock ? (
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <AlertDescription>
            {isBlock ? (
              <>
                <strong>This message contains restricted content.</strong> For your protection, 
                messages containing payment instructions or requests to communicate outside the 
                platform cannot be sent.
              </>
            ) : (
              <>
                <strong>Safety reminder:</strong> For your protection and to stay covered by 
                platform policies, please keep all communication and payments within the app. 
                We detected: {matches.map(m => m.keyword).join(', ')}
              </>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
