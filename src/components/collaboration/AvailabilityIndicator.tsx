import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProfessionalAvailability } from '@/hooks/useProfessionalAvailability';
import { Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AvailabilityIndicatorProps {
  professionalId: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AvailabilityIndicator: React.FC<AvailabilityIndicatorProps> = ({
  professionalId,
  showLabel = true,
  size = 'md'
}) => {
  const { availability, loading } = useProfessionalAvailability(professionalId);

  if (loading) {
    return <Badge variant="outline" className="animate-pulse">Loading...</Badge>;
  }

  if (!availability) {
    return showLabel ? <Badge variant="outline">Unknown</Badge> : null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-500';
      case 'busy':
        return 'text-yellow-500';
      case 'away':
        return 'text-orange-500';
      case 'offline':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'busy':
        return 'secondary';
      case 'away':
        return 'outline';
      case 'offline':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const sizeClass = size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3';

  const tooltipContent = (
    <div className="space-y-1">
      <p className="font-medium capitalize">{availability.status}</p>
      {availability.custom_message && (
        <p className="text-sm">{availability.custom_message}</p>
      )}
      {availability.available_until && (
        <p className="text-xs text-muted-foreground">
          Until {formatDistanceToNow(new Date(availability.available_until), { addSuffix: true })}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Updated {formatDistanceToNow(new Date(availability.updated_at), { addSuffix: true })}
      </p>
    </div>
  );

  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Circle className={`${sizeClass} ${getStatusColor(availability.status)} fill-current`} />
          </TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getStatusBadge(availability.status)} className="cursor-help">
            <Circle className={`mr-1 ${sizeClass} ${getStatusColor(availability.status)} fill-current`} />
            {availability.status}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AvailabilityIndicator;
