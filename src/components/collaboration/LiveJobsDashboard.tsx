import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtimeJobUpdates } from '@/hooks/useRealtimeJobUpdates';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LiveJobsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { jobs, loading } = useRealtimeJobUpdates(user?.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filterJobsByStatus = (status: string) => {
    return jobs.filter(job => job.status === status);
  };

  const openJobs = filterJobsByStatus('open');
  const inProgressJobs = filterJobsByStatus('in_progress');
  const completedJobs = filterJobsByStatus('completed');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Jobs Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading jobs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Live Jobs Dashboard
          <Badge variant="outline" className="ml-auto">
            {jobs.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="open">
              Open ({openJobs.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              Active ({inProgressJobs.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Done ({completedJobs.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="all" className="mt-0 space-y-3">
              {jobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No jobs yet</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <h3 className="font-medium">{job.title}</h3>
                      </div>
                      <Badge variant={getStatusBadge(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {job.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {job.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </span>
                      {job.budget_value && (
                        <span className="font-medium text-foreground">
                          ${job.budget_value}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="open" className="mt-0 space-y-3">
              {openJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <h3 className="font-medium">{job.title}</h3>
                    </div>
                    <Badge variant="default">Open</Badge>
                  </div>
                  {job.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {job.description}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="in_progress" className="mt-0 space-y-3">
              {inProgressJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <h3 className="font-medium">{job.title}</h3>
                    </div>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  {job.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {job.description}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Started {formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="mt-0 space-y-3">
              {completedJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer opacity-75"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <h3 className="font-medium">{job.title}</h3>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                  {job.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {job.description}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Completed {formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LiveJobsDashboard;
