import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Image, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobMetadataBadgesProps {
  startDate?: string;
  location?: string;
  photoCount?: number;
  answerCount?: number;
  className?: string;
}

export const JobMetadataBadges: React.FC<JobMetadataBadgesProps> = ({
  startDate,
  location,
  photoCount = 0,
  answerCount = 0,
  className
}) => {
  const getStartDateLabel = (date?: string) => {
    if (!date) return null;
    const start = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'ASAP';
    if (diffDays <= 7) return 'This Week';
    if (diffDays <= 14) return 'Next Week';
    return 'Later';
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {startDate && getStartDateLabel(startDate) && (
        <Badge variant="outline" className="text-xs">
          <Calendar className="w-3 h-3 mr-1" />
          Starts: {getStartDateLabel(startDate)}
        </Badge>
      )}
      
      {location && (
        <Badge variant="outline" className="text-xs">
          <MapPin className="w-3 h-3 mr-1" />
          {location}
        </Badge>
      )}
      
      {photoCount > 0 && (
        <Badge variant="outline" className="text-xs bg-primary/5">
          <Image className="w-3 h-3 mr-1" />
          {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
        </Badge>
      )}
      
      {answerCount > 0 && (
        <Badge variant="outline" className="text-xs">
          <FileText className="w-3 h-3 mr-1" />
          {answerCount} details
        </Badge>
      )}
    </div>
  );
};
