/**
 * Activity Feed Component
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * Display activity timeline
 */

import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from '@/lib/collaboration';
import { cn } from '@/lib/utils';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Share2,
  UserPlus,
  UserMinus,
} from 'lucide-react';

interface ActivityFeedProps {
  activities: Activity[];
  maxHeight?: string;
  className?: string;
}

const activityIcons = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  comment: MessageSquare,
  share: Share2,
  join: UserPlus,
  leave: UserMinus,
};

const activityColors = {
  create: 'text-green-500',
  update: 'text-blue-500',
  delete: 'text-red-500',
  view: 'text-gray-500',
  comment: 'text-purple-500',
  share: 'text-orange-500',
  join: 'text-cyan-500',
  leave: 'text-gray-400',
};

export function ActivityFeed({
  activities,
  maxHeight = '400px',
  className,
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <p className="text-muted-foreground text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className={cn('pr-4', className)}>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const iconColor = activityColors[activity.type];

          return (
            <div key={activity.id} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                <AvatarFallback>
                  {activity.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', iconColor)} />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.userName}</span>
                      {' '}
                      <span className="text-muted-foreground">{activity.action}</span>
                      {' '}
                      <span>{activity.description}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
