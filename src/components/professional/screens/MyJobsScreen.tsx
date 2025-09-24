import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, MapPin, Clock, CheckCircle2, Camera, 
  MessageSquare, FileText, Calendar, Edit,
  Navigation, AlertCircle, Pause, CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface MyJobsScreenProps {
  user: any;
}

export const MyJobsScreen = ({ user }: MyJobsScreenProps) => {
  const [activeTab, setActiveTab] = useState('active');

  const jobs = {
    active: [
      {
        id: '1',
        title: 'Kitchen Installation - Phase 2',
        client: 'Sarah Johnson',
        address: '123 Main St, Dublin',
        status: 'in_progress',
        progress: 65,
        startTime: '09:00',
        estimatedEnd: '16:00',
        checklist: [
          { item: 'Install base cabinets', done: true },
          { item: 'Mount wall cabinets', done: true },
          { item: 'Install countertops', done: false },
          { item: 'Connect plumbing', done: false },
          { item: 'Final cleanup', done: false }
        ],
        photos: { before: 2, during: 5, after: 0 },
        lastUpdate: '2 hours ago'
      }
    ],
    upcoming: [
      {
        id: '2',
        title: 'Bathroom Renovation Consultation',
        client: 'Michael Chen',
        address: '456 Oak Ave, Rathmines',
        scheduledDate: 'Tomorrow, 10:00 AM',
        duration: '2 hours',
        type: 'consultation',
        notes: 'Bring measurement tools and portfolio examples'
      },
      {
        id: '3',
        title: 'Plumbing Repair',
        client: 'Emma Wilson',
        address: '789 Pine St, Blackrock',
        scheduledDate: 'Friday, 14:00',
        duration: '3-4 hours',
        type: 'repair',
        urgency: 'high'
      }
    ],
    completed: [
      {
        id: '4',
        title: 'Tile Installation',
        client: 'David Brown',
        completedDate: 'Yesterday',
        rating: 5,
        review: 'Excellent work, very professional and clean.',
        earnings: '€450'
      }
    ]
  };

  const handleJobAction = (action: string, jobId: string) => {
    toast.success(`${action} action completed for job ${jobId}`);
  };

  const renderActiveJobs = () => (
    <div className="space-y-4">
      {jobs.active.map((job) => (
        <Card key={job.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{job.client}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  {job.address}
                </div>
              </div>
              <Badge variant={job.status === 'in_progress' ? 'default' : 'secondary'}>
                {job.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="h-2" />
            </div>

            {/* Time Info */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{job.startTime} - {job.estimatedEnd}</span>
              </div>
              <span className="text-muted-foreground">Updated {job.lastUpdate}</span>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleJobAction('pause', job.id)}>
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleJobAction('photos', job.id)}>
                <Camera className="w-3 h-3 mr-1" />
                Photos ({job.photos.before + job.photos.during})
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleJobAction('checklist', job.id)}>
                <CheckSquare className="w-3 h-3 mr-1" />
                Checklist
              </Button>
              <Button size="sm" onClick={() => handleJobAction('update', job.id)}>
                Update
              </Button>
            </div>

            {/* Checklist Preview */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Today's Tasks</h4>
              <div className="space-y-1">
                {job.checklist.slice(0, 3).map((task, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded border ${task.done ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`}>
                      {task.done && <CheckCircle2 className="w-2 h-2 text-white" />}
                    </div>
                    <span className={task.done ? 'line-through text-muted-foreground' : ''}>{task.item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderUpcomingJobs = () => (
    <div className="space-y-4">
      {jobs.upcoming.map((job) => (
        <Card key={job.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{job.client}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  {job.address}
                </div>
              </div>
              <div className="text-right">
                <Badge variant={job.urgency === 'high' ? 'destructive' : 'outline'}>
                  {job.type}
                </Badge>
                {job.urgency === 'high' && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-600">Urgent</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{job.scheduledDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{job.duration}</span>
              </div>
            </div>

            {job.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-xs text-blue-800">{job.notes}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleJobAction('navigate', job.id)}>
                <Navigation className="w-3 h-3 mr-1" />
                Navigate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleJobAction('reschedule', job.id)}>
                <Calendar className="w-3 h-3 mr-1" />
                Reschedule
              </Button>
              <Button size="sm" onClick={() => handleJobAction('start', job.id)}>
                <Play className="w-3 h-3 mr-1" />
                Start Job
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCompletedJobs = () => (
    <div className="space-y-4">
      {jobs.completed.map((job) => (
        <Card key={job.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{job.title}</h4>
                <p className="text-sm text-muted-foreground">{job.client}</p>
                <p className="text-xs text-muted-foreground">Completed {job.completedDate}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < job.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                  ))}
                  <span className="text-sm font-medium ml-1">€{job.earnings}</span>
                </div>
              </div>
            </div>
            {job.review && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-800">"{job.review}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Play className="w-3 h-3" />
            Active ({jobs.active.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            Upcoming ({jobs.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" />
            Completed ({jobs.completed.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          {renderActiveJobs()}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4">
          {renderUpcomingJobs()}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          {renderCompletedJobs()}
        </TabsContent>
      </Tabs>
    </div>
  );
};