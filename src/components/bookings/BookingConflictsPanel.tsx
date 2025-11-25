import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookingConflicts } from '@/hooks/bookings';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface BookingConflictsPanelProps {
  bookingId: string;
}

export const BookingConflictsPanel = ({ bookingId }: BookingConflictsPanelProps) => {
  const { conflicts, isLoading, detectConflicts, resolveConflict } = useBookingConflicts(bookingId);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Booking Conflicts
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => detectConflicts(bookingId)}
          >
            Check for Conflicts
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading conflicts...</p>
        ) : !conflicts || conflicts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            No conflicts detected
          </div>
        ) : (
          <div className="space-y-3">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="p-3 rounded-lg border bg-card space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(conflict.severity)}>
                        {conflict.severity}
                      </Badge>
                      <span className="text-sm font-medium capitalize">
                        {conflict.conflict_type.replace('_', ' ')}
                      </span>
                    </div>
                    {conflict.conflict_details && (
                      <p className="text-sm text-muted-foreground">
                        {JSON.stringify(conflict.conflict_details)}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      resolveConflict({
                        conflictId: conflict.id,
                        resolutionNotes: 'Resolved by user',
                      })
                    }
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
