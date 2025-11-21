import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export function AnalyticsNavCard() {
  const navigate = useNavigate();

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics & Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Access detailed analytics about your hiring performance, payments, and professional relationships.
        </p>
        <Button 
          onClick={() => navigate('/dashboard/client/analytics')}
          className="w-full sm:w-auto"
        >
          View Full Analytics
        </Button>
      </CardContent>
    </Card>
  );
}
