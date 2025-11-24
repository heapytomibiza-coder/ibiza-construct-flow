import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Inbox, 
  FileText, 
  CheckCircle, 
  Clock, 
  PlayCircle,
  AlertCircle,
  ChevronRight,
  DollarSign
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  client: string;
  status: 'lead' | 'quoted' | 'accepted' | 'in_progress' | 'review';
  value?: number;
  urgency?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

interface JobsPipelineProps {
  jobs?: Job[];
}

export function JobsPipeline({ jobs = [] }: JobsPipelineProps) {
  // Sample data if none provided
  const defaultJobs: Job[] = [
    { 
      id: '1', 
      title: 'Kitchen Cabinet Installation', 
      client: 'Maria G.', 
      status: 'lead',
      value: 2400,
      urgency: 'high'
    },
    { 
      id: '2', 
      title: 'Bathroom Vanity Build', 
      client: 'John S.', 
      status: 'quoted',
      value: 1800,
      urgency: 'medium',
      dueDate: 'Tomorrow'
    },
    { 
      id: '3', 
      title: 'Office Furniture Set', 
      client: 'Tech Corp', 
      status: 'accepted',
      value: 3200,
      urgency: 'low',
      dueDate: 'Next week'
    },
    { 
      id: '4', 
      title: 'Custom Wardrobe', 
      client: 'Sarah M.', 
      status: 'in_progress',
      value: 2100,
      urgency: 'medium',
      dueDate: 'In 3 days'
    },
    { 
      id: '5', 
      title: 'Bookshelf Unit', 
      client: 'Alex P.', 
      status: 'review',
      value: 950,
      urgency: 'low'
    },
  ];

  const data = jobs.length > 0 ? jobs : defaultJobs;

  const stages = [
    { 
      key: 'lead' as const, 
      label: 'New Leads', 
      icon: Inbox, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    { 
      key: 'quoted' as const, 
      label: 'Quoted', 
      icon: FileText, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    { 
      key: 'accepted' as const, 
      label: 'Accepted', 
      icon: CheckCircle, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    { 
      key: 'in_progress' as const, 
      label: 'In Progress', 
      icon: PlayCircle, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    { 
      key: 'review' as const, 
      label: 'Review', 
      icon: Clock, 
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    },
  ];

  const getJobsByStage = (stage: typeof stages[0]['key']) => {
    return data.filter(job => job.status === stage);
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const totalValue = data.reduce((sum, job) => sum + (job.value || 0), 0);

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="w-full sm:w-auto">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="hidden sm:inline">Jobs Pipeline</span>
              <span className="sm:hidden">Pipeline</span>
              <Badge variant="secondary" className="text-xs">{data.length} active</Badge>
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Pipeline value: <span className="font-bold text-foreground">€{totalValue.toLocaleString()}</span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0">
        <ScrollArea className="h-[500px] sm:h-[600px] pr-2 sm:pr-4">
          <div className="space-y-4 sm:space-y-6">
            {stages.map((stage) => {
              const stageJobs = getJobsByStage(stage.key);
              const stageValue = stageJobs.reduce((sum, job) => sum + (job.value || 0), 0);
              const StageIcon = stage.icon;

              return (
                <div key={stage.key} className="space-y-2 sm:space-y-3">
                  {/* Stage Header - Mobile Optimized */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 sm:p-1.5 rounded-lg ${stage.bgColor}`}>
                        <StageIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${stage.color}`} />
                      </div>
                      <h3 className="font-semibold text-xs sm:text-sm">{stage.label}</h3>
                      <Badge variant="outline" className="text-[10px] sm:text-xs">
                        {stageJobs.length}
                      </Badge>
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                      €{stageValue.toLocaleString()}
                    </div>
                  </div>

                  {/* Stage Jobs - Mobile Optimized */}
                  <div className="space-y-2 pl-1 sm:pl-2">
                    {stageJobs.length === 0 ? (
                      <div className="text-[10px] sm:text-xs text-muted-foreground italic py-2">
                        No jobs in this stage
                      </div>
                    ) : (
                      stageJobs.map((job) => (
                        <Card 
                          key={job.id} 
                          className={`border-l-4 ${stage.borderColor} hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]`}
                        >
                          <CardContent className="p-2 sm:p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                                  <h4 className="font-medium text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                                    {job.title}
                                  </h4>
                                  {job.urgency && (
                                    <Badge 
                                      variant={getUrgencyColor(job.urgency)} 
                                      className="text-[10px] sm:text-xs flex-shrink-0"
                                    >
                                      {job.urgency === 'high' && <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />}
                                      {job.urgency}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                                  <span className="truncate">{job.client}</span>
                                  {job.value && (
                                    <>
                                      <span className="hidden sm:inline">•</span>
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-2 w-2 sm:h-3 sm:w-3" />
                                        <span className="font-medium">€{job.value.toLocaleString()}</span>
                                      </div>
                                    </>
                                  )}
                                  {job.dueDate && (
                                    <>
                                      <span className="hidden sm:inline">•</span>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
                                        <span className="hidden sm:inline">{job.dueDate}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 p-0 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
