import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  amount: number;
  status: string;
  milestone_number: number;
  due_date?: string;
  completed_date?: string;
  auto_release_date?: string;
  approval_deadline?: string;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onMilestoneClick?: (milestone: Milestone) => void;
}

export const MilestoneTimeline = ({ milestones, onMilestoneClick }: MilestoneTimelineProps) => {
  const sortedMilestones = [...milestones].sort((a, b) => a.milestone_number - b.milestone_number);
  const completedCount = milestones.filter(m => m.status === 'completed' || m.status === 'released').length;
  const progress = (completedCount / milestones.length) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'released':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'pending':
        return <Circle className="w-5 h-5 text-muted-foreground" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'released':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Progress</h3>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {milestones.length} milestones completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      <div className="space-y-4">
        {sortedMilestones.map((milestone, index) => (
          <Card
            key={milestone.id}
            className={`p-6 cursor-pointer transition-all hover:shadow-md ${
              milestone.status === 'in_progress' ? 'border-primary' : ''
            }`}
            onClick={() => onMilestoneClick?.(milestone)}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                {getStatusIcon(milestone.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{milestone.milestone_number}
                    </span>
                    <h4 className="font-semibold">{milestone.title}</h4>
                  </div>
                  <Badge variant={getStatusColor(milestone.status)}>
                    {milestone.status.replace('_', ' ')}
                  </Badge>
                </div>

                {milestone.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {milestone.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount: </span>
                    <span className="font-medium">${milestone.amount.toFixed(2)}</span>
                  </div>

                  {milestone.due_date && (
                    <div>
                      <span className="text-muted-foreground">Due: </span>
                      <span className="font-medium">
                        {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {milestone.completed_date && (
                    <div>
                      <span className="text-muted-foreground">Completed: </span>
                      <span className="font-medium">
                        {format(new Date(milestone.completed_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {milestone.auto_release_date && milestone.status === 'completed' && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-warning" />
                      <span className="text-muted-foreground">Auto-release: </span>
                      <span className="font-medium text-warning">
                        {format(new Date(milestone.auto_release_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                {milestone.approval_deadline && 
                 milestone.status === 'completed' &&
                 new Date(milestone.approval_deadline) < new Date() && (
                  <div className="mt-3 p-2 bg-warning/10 rounded-md flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <span className="text-sm text-warning">
                      Approval deadline passed - auto-release pending
                    </span>
                  </div>
                )}
              </div>

              {index < sortedMilestones.length - 1 && (
                <div className="absolute left-[2.125rem] top-[4.5rem] w-0.5 h-full bg-border -z-10" />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
