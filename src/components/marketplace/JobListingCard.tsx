import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Clock, Euro, User, Calendar, 
  MessageSquare, Heart, Share2, Sparkles, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobPaymentWidget } from '@/components/jobs/JobPaymentWidget';
import { JobDetailsModal } from './JobDetailsModal';

interface JobListingCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget_type: 'fixed' | 'hourly';
    budget_value: number;
    location?: {
      address: string;
      area: string;
    };
    created_at: string;
    status: string;
    client: {
      name: string;
      avatar?: string;
      rating?: number;
      jobs_completed?: number;
    };
    answers?: any;
    micro_id?: string;
  };
  onSendOffer?: (jobId: string) => void;
  onMessage?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  className?: string;
  viewMode?: 'card' | 'compact';
}

export const JobListingCard: React.FC<JobListingCardProps> = ({
  job,
  onSendOffer,
  onMessage,
  onSave,
  className,
  viewMode = 'card'
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const isNew = new Date(job.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  if (viewMode === 'compact') {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
                {isNew && (
                  <Badge className="bg-gradient-to-r from-copper to-copper-dark text-white text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    NEW
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">{job.status}</Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {job.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  <span className="font-medium">
                    €{job.budget_value}
                    {job.budget_type === 'hourly' && '/hr'}
                  </span>
                </div>
                
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location.area}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>

                {/* Payment status widget */}
                <JobPaymentWidget jobId={job.id} />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSendOffer?.(job.id)}
              >
                Send Offer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{job.title}</CardTitle>
              {isNew && (
                <Badge className="bg-gradient-to-r from-copper to-copper-dark text-white text-xs animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  NEW
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{job.client.name}</span>
                {job.client.rating && (
                  <span className="text-yellow-500">★ {job.client.rating}</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
              </div>

              {/* Payment status widget */}
              <JobPaymentWidget jobId={job.id} />
            </div>
          </div>
          
          <Badge 
            variant={job.status === 'open' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {job.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {job.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="font-semibold text-lg text-primary">
              €{job.budget_value}
              {job.budget_type === 'hourly' && (
                <span className="text-sm font-normal">/hour</span>
              )}
            </p>
          </div>
          
          {job.location && (
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{job.location.area}</span>
              </div>
            </div>
          )}
        </div>

        {/* Additional job details from answers */}
        {job.answers && Object.keys(job.answers).length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Requirements:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(job.answers).slice(0, 3).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {String(value).substring(0, 20)}
                  {String(value).length > 20 && '...'}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSave?.(job.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Heart className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessage?.(job.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetailsModal(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            
            <Button 
              onClick={() => onSendOffer?.(job.id)}
              className="bg-gradient-hero text-white"
            >
              Send Offer
            </Button>
          </div>
        </div>
        
        <JobDetailsModal
          job={job}
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onApply={onSendOffer}
        />
      </CardContent>
    </Card>
  );
};