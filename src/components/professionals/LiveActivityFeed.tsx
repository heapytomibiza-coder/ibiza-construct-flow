import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Eye, MessageCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityItem {
  id: string;
  type: 'view' | 'message' | 'review' | 'booking';
  text: string;
  timestamp: string;
}

interface LiveActivityFeedProps {
  professionalName: string;
}

export const LiveActivityFeed = ({ professionalName }: LiveActivityFeedProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Simulate real-time activity
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'view',
        text: 'Someone viewed this profile',
        timestamp: '2 minutes ago'
      },
      {
        id: '2',
        type: 'message',
        text: 'New message received',
        timestamp: '15 minutes ago'
      },
      {
        id: '3',
        type: 'review',
        text: 'New 5-star review posted',
        timestamp: '1 hour ago'
      },
      {
        id: '4',
        type: 'booking',
        text: 'Consultation booked',
        timestamp: '2 hours ago'
      }
    ];

    setActivities(mockActivities);

    // Simulate new activity every 30 seconds
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: ['view', 'message'][Math.floor(Math.random() * 2)] as 'view' | 'message',
        text: Math.random() > 0.5 ? 'Someone viewed this profile' : 'Profile shared',
        timestamp: 'Just now'
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 3)]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'view':
        return Eye;
      case 'message':
        return MessageCircle;
      case 'review':
        return Star;
      default:
        return Activity;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'view':
        return 'text-blue-500';
      case 'message':
        return 'text-green-500';
      case 'review':
        return 'text-yellow-500';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activities.map((activity, index) => {
              const Icon = getIcon(activity.type);
              const colorClass = getColor(activity.type);

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full bg-background flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-center text-muted-foreground">
            🔥 This profile is trending in your area
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
