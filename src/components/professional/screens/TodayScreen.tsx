import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, Clock, TrendingUp, Target, Zap, 
  Play, Navigation, CheckCircle2, AlertCircle
} from 'lucide-react';

interface TodayScreenProps {
  stats: any;
  user: any;
}

export const TodayScreen = ({ stats, user }: TodayScreenProps) => {
  const earningsProgress = (stats.todayEarnings / stats.weeklyTarget) * 100;
  
  const queueItems = [
    { id: '1', type: 'lead', title: 'Bathroom Renovation Quote', status: 'pending', urgent: true },
    { id: '2', type: 'booked', title: 'Kitchen Installation', status: 'today', time: '14:30' },
    { id: '3', type: 'progress', title: 'Plumbing Repair', status: 'active', progress: 75 },
    { id: '4', type: 'wrapup', title: 'Tile Work', status: 'complete', needsPhotos: true }
  ];

  const aiSuggestions = [
    { 
      title: 'Reply to Kitchen Quote', 
      description: 'Draft ready: "Thanks for your inquiry. I can complete this within 3 days..."',
      type: 'reply'
    },
    { 
      title: 'Price Adjustment Suggestion', 
      description: 'Bathroom job: Consider adding +€50 for weekend work',
      type: 'pricing'
    },
    { 
      title: 'Route Optimization', 
      description: 'Cluster 3 nearby jobs tomorrow to save 45 mins travel',
      type: 'route'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Top Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Earnings Thermometer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>€{stats.todayEarnings}</span>
                <span className="text-muted-foreground">/ €{Math.round(stats.weeklyTarget / 7)}</span>
              </div>
              <Progress value={earningsProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {earningsProgress.toFixed(0)}% of daily target
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Job */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Next Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.nextJob ? (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{stats.nextJob.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{stats.nextJob.eta}</span>
                  <MapPin className="w-3 h-3 ml-1" />
                  <span>{stats.nextJob.distance}</span>
                </div>
                <Button size="sm" className="w-full">
                  <Play className="w-3 h-3 mr-1" />
                  Start Job
                </Button>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No jobs scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gaps & Suggestions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Fill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">3 filler jobs nearby</p>
              <div className="space-y-1">
                <div className="text-xs">
                  <span className="font-medium">2:00-4:00 PM</span>
                  <span className="text-muted-foreground ml-2">Leak Repair (5 min away)</span>
                </div>
                <div className="text-xs">
                  <span className="font-medium">Evening slot</span>
                  <span className="text-muted-foreground ml-2">Consultation (virtual)</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">
                Auto-bid on gaps
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Today's Queue
            <Badge variant="secondary">{queueItems.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {queueItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    {item.type === 'lead' && <AlertCircle className="w-4 h-4 text-orange-500" />}
                    {item.type === 'booked' && <Clock className="w-4 h-4 text-blue-500" />}
                    {item.type === 'progress' && <Play className="w-4 h-4 text-green-500" />}
                    {item.type === 'wrapup' && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                    <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.time && <span>{item.time}</span>}
                      {item.progress && <span>{item.progress}% complete</span>}
                      {item.urgent && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                      {item.needsPhotos && <Badge variant="outline" className="text-xs">Photos needed</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {item.type === 'lead' && (
                    <>
                      <Button size="sm" variant="outline">Ask</Button>
                      <Button size="sm">Quote</Button>
                    </>
                  )}
                  {item.type === 'booked' && (
                    <Button size="sm">
                      <Navigation className="w-3 h-3 mr-1" />
                      Navigate
                    </Button>
                  )}
                  {item.type === 'progress' && (
                    <Button size="sm" variant="outline">Update</Button>
                  )}
                  {item.type === 'wrapup' && (
                    <Button size="sm">Finish</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {suggestion.description}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-2">
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};