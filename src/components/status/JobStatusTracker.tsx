import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Star, MessageCircle } from 'lucide-react';

interface JobStatusTrackerProps {
  job: {
    id: string;
    title: string;
    status: 'open' | 'invited' | 'offered' | 'assigned' | 'in_progress' | 'complete_pending' | 'complete' | 'disputed' | 'cancelled';
    createdAt: string;
    professional?: {
      name: string;
      avatar?: string;
    };
  };
}

export const JobStatusTracker = ({ job }: JobStatusTrackerProps) => {
  const statusSteps = [
    { key: 'open', label: 'Posted', icon: Clock },
    { key: 'offered', label: 'Offers Received', icon: MessageCircle },
    { key: 'assigned', label: 'Professional Hired', icon: CheckCircle },
    { key: 'in_progress', label: 'Work in Progress', icon: Clock },
    { key: 'complete', label: 'Completed', icon: Star },
  ];

  const getCurrentStepIndex = () => {
    const statusOrder = ['open', 'offered', 'assigned', 'in_progress', 'complete'];
    return statusOrder.indexOf(job.status);
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'complete':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'assigned':
        return 'text-purple-600 bg-purple-50';
      case 'offered':
        return 'text-orange-600 bg-orange-50';
      case 'disputed':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusMessage = () => {
    switch (job.status) {
      case 'open':
        return 'Your job is live and professionals can apply';
      case 'offered':
        return 'You have received offers from professionals';
      case 'assigned':
        return `${job.professional?.name} has been hired for this job`;
      case 'in_progress':
        return 'Work is currently in progress';
      case 'complete':
        return 'Job completed successfully!';
      case 'disputed':
        return 'There is a dispute that needs resolution';
      case 'cancelled':
        return 'This job was cancelled';
      default:
        return 'Processing...';
    }
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-sm text-muted-foreground">
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge className={getStatusColor()}>
            {job.status === 'in_progress' ? 'In Progress' : 
             job.status === 'complete_pending' ? 'Awaiting Review' :
             job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
        </div>

        {/* Status Message */}
        <div className="p-4 bg-gradient-card rounded-lg">
          <div className="flex items-center space-x-2">
            {job.status === 'disputed' ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <p className="text-sm">{getStatusMessage()}</p>
          </div>
        </div>

        {/* Progress Steps */}
        {job.status !== 'disputed' && job.status !== 'cancelled' && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Progress</h4>
            <div className="space-y-3">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const IconComponent = step.icon;
                
                return (
                  <div key={step.key} className="flex items-center space-x-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${isCompleted 
                        ? 'bg-primary text-white' 
                        : 'bg-muted text-muted-foreground'
                      }
                      ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                    `}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};