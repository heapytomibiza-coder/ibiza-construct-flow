import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingStatusTrackerProps {
  currentStatus: string;
}

const statuses = [
  { key: 'pending', label: 'Request Sent', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'in_progress', label: 'In Progress', icon: Clock },
  { key: 'completed', label: 'Completed', icon: Check },
];

export function BookingStatusTracker({ currentStatus }: BookingStatusTrackerProps) {
  const currentIndex = statuses.findIndex(s => s.key === currentStatus);

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${(currentIndex / (statuses.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Status points */}
        {statuses.map((status, index) => {
          const Icon = status.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status.key} className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-muted text-muted-foreground',
                  isCurrent && 'ring-4 ring-primary/20'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  'text-sm font-medium text-center',
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {status.label}
              </span>
            </div>
          );
        })}
      </div>

      {currentStatus === 'cancelled' && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Booking Cancelled</p>
            <p className="text-sm text-muted-foreground mt-1">
              This booking has been cancelled and is no longer active.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
