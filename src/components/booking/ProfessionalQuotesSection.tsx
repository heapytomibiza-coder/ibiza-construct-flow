/**
 * @deprecated This component is deprecated. Use ProfessionalJobQuotesSection instead.
 * This component fetches from the legacy booking_requests table.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProfessionalQuotesSectionProps {
  professionalId: string;
}

export const ProfessionalQuotesSection = ({ professionalId }: ProfessionalQuotesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This section has been deprecated. Please use the new unified quote system in your dashboard.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
