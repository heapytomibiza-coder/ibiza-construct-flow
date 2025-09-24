import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, Clock, Plus, Zap, Navigation, 
  Leaf, DollarSign, Target, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleScreenProps {
  user: any;
}

export const ScheduleScreen = ({ user }: ScheduleScreenProps) => {
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = this week, 1 = next week
  const [weekFill, setWeekFill] = useState(0.75);

  const schedule = {
    thisWeek: [
      { day: 'Mon', date: '24', slots: [
        { time: '09:00-12:00', job: 'Kitchen Install - Phase 1', status: 'booked' },
        { time: '14:00-17:00', job: 'Available', status: 'free' }
      ]},
      { day: 'Tue', date: '25', slots: [
        { time: '09:00-11:00', job: 'Plumbing Consultation', status: 'booked' },
        { time: '13:00-18:00', job: 'Available', status: 'free' }
      ]},
      { day: 'Wed', date: '26', slots: [
        { time: '10:00-15:00', job: 'Bathroom Renovation', status: 'booked' },
        { time: '15:30-17:00', job: 'Available', status: 'free' }
      ]},
      { day: 'Thu', date: '27', slots: [
        { time: '09:00-17:00', job: 'Available', status: 'free' }
      ]},
      { day: 'Fri', date: '28', slots: [
        { time: '09:00-12:00', job: 'Tile Repair', status: 'booked' },
        { time: '14:00-17:00', job: 'Available', status: 'free' }
      ]},
      { day: 'Sat', date: '29', slots: [
        { time: '10:00-14:00', job: 'Available (Weekend Rate)', status: 'free' }
      ]},
      { day: 'Sun', date: '30', slots: [
        { time: 'Rest Day', job: 'No availability', status: 'blocked' }
      ]}
    ]
  };

  const gapFillerJobs = [
    {
      id: '1',
      title: 'Leak Repair - Emergency',
      duration: '2 hours',
      slot: 'Thu 14:00-16:00',
      distance: '5 min away',
      budget: '€200-300',
      urgency: 'high',
      routeSavings: '€15 fuel saved'
    },
    {
      id: '2',
      title: 'Virtual Consultation',
      duration: '1 hour',
      slot: 'Any evening slot',
      distance: 'Remote',
      budget: '€75',
      urgency: 'low',
      routeSavings: 'No travel needed'
    },
    {
      id: '3',
      title: 'Quick Tile Touch-up',
      duration: '90 minutes',
      slot: 'Fri after current job',
      distance: '2 min from Fri job',
      budget: '€120',
      urgency: 'medium',
      routeSavings: '€25 travel time saved'
    }
  ];

  const handleAutoBid = (jobId: string) => {
    toast.success(`Auto-bid placed for job ${jobId}`);
  };

  const handleSetAvailability = () => {
    toast.info('Availability editor opening...');
  };

  const handleSyncCalendar = () => {
    toast.success('Calendar sync completed');
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-green-100 border-green-300 text-green-800';
      case 'free': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'blocked': return 'bg-gray-100 border-gray-300 text-gray-600';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header with Week Fill Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">This Week's Schedule</CardTitle>
            <div className="text-right">
              <div className="text-sm font-medium">{Math.round(weekFill * 100)}% Full</div>
              <div className="text-xs text-muted-foreground">Week Fill Target</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={weekFill * 100} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Target: 80% weekly utilization</span>
              <span>{weekFill >= 0.8 ? '🎯 Target reached!' : `+${Math.round((0.8 - weekFill) * 40)}h needed`}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={handleSetAvailability} className="h-12">
          <Calendar className="w-4 h-4 mr-2" />
          Set Availability
        </Button>
        <Button variant="outline" onClick={handleSyncCalendar} className="h-12">
          <Plus className="w-4 h-4 mr-2" />
          Sync Calendar
        </Button>
      </div>

      {/* Weekly Schedule View */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekly View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.thisWeek.map((day) => (
              <div key={day.day} className="border rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-center min-w-[50px]">
                    <div className="font-medium text-sm">{day.day}</div>
                    <div className="text-xs text-muted-foreground">{day.date}</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {day.slots.map((slot, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded border text-xs ${getSlotColor(slot.status)}`}
                      >
                        <div className="font-medium">{slot.time}</div>
                        <div className="opacity-90">{slot.job}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fill Gaps Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Fill Your Gaps
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-suggested jobs that fit your open slots
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gapFillerJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{job.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {job.distance}
                      </span>
                    </div>
                  </div>
                  <Badge variant={job.urgency === 'high' ? 'destructive' : job.urgency === 'medium' ? 'default' : 'secondary'}>
                    {job.urgency}
                  </Badge>
                </div>

                <div className="bg-muted/50 rounded p-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{job.slot}</span>
                    <span className="text-green-600">{job.budget}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Leaf className="w-3 h-3" />
                    <span>{job.routeSavings}</span>
                  </div>
                  <Button size="sm" onClick={() => handleAutoBid(job.id)}>
                    Auto-bid
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            <Target className="w-4 h-4 mr-2" />
            Find More Gap Fillers
          </Button>
        </CardContent>
      </Card>

      {/* Travel Optimization Insight */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-2">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-green-800 text-sm">This Week's Route Impact</h4>
              <p className="text-xs text-green-700 mt-1">
                Current schedule saves 2.5 hours travel time and €45 in fuel vs scattered bookings
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="text-green-600">⏱️ -2.5h travel</span>
                <span className="text-green-600">🚗 -45km driving</span>
                <span className="text-green-600">🌱 -12kg CO₂</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};