import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Notification } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'low':
      return <Info className="h-4 w-4 text-blue-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
};

const getCategoryColor = (category: string) => {
  const colors = {
    jobs: 'bg-blue-500',
    messages: 'bg-purple-500',
    bookings: 'bg-green-500',
    reviews: 'bg-yellow-500',
    payments: 'bg-emerald-500',
    system: 'bg-gray-500',
  };
  return colors[category as keyof typeof colors] || 'bg-gray-500';
};

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDismiss,
}: NotificationItemProps) => {
  const [hovering, setHovering] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss(notification.id);
  };

  return (
    <div
      className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer relative ${
        !notification.read_at ? 'bg-accent/20' : ''
      }`}
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{getPriorityIcon(notification.priority)}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            {hovering && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={handleDismiss}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {notification.message}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={`text-xs ${getCategoryColor(notification.category)} text-white`}
            >
              {notification.category}
            </Badge>
            
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            
            {!notification.read_at && (
              <Badge variant="default" className="text-xs">
                New
              </Badge>
            )}
          </div>
          
          {notification.action_url && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto mt-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              {notification.action_text || 'View'}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
